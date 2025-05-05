<script lang="ts">
  import {
    Label,
    Input,
    Textarea,
    Helper,
    Fileupload,
    Button,
    Hr,
    Progressbar,
    Heading,
    Badge,
  } from "flowbite-svelte";
  import { currentUser, pb } from "$lib/stores/pocketbase";
  import Error from "../../components/Error.svelte";
  import { goto } from "$app/navigation";
  import { env } from "$env/dynamic/public";

  let progress = $state(0);
  let file = $state<FileList | undefined>(undefined);
  let selectedTags = $state<string[]>([]);
  let tagInput = $state("");
  let error = $state("");

  let form = {
    title: "",
    description: "",
  };

  let textAreaProps = {
    id: "description",
    name: "description",
    label: "Description",
    rows: 4,
    placeholder: "Additional information...",
  };

  async function create() {
    if (!$currentUser || !file) return;

    const formData = new FormData();
    formData.append("user_id", $currentUser.id);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("tags", JSON.stringify(selectedTags));
    formData.append("file", file[0]);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      env.PUBLIC_POCKETBASE_URL + "/api/collections/posts/records",
      true
    );
    xhr.setRequestHeader("Authorization", "Bearer " + pb.authStore.token);

    try {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          progress = (event.loaded / event.total) * 100;
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          clear();
        } else {
          error = xhr.responseText;
        }
      };

      xhr.onerror = () => {
        error = xhr.responseText;
      };

      xhr.send(formData);
    } catch (err: any) {
      error =
        err?.response.message ||
        console.log(
          "An unexpected error occurred. Please check the console and report."
        );
    }
  }

  async function clear() {
    selectedTags = [];
    file = undefined;
    progress = 0;

    await goto("/");
  }
</script>

<svelte:head>
  <title>New</title>
</svelte:head>

<form class="max-w-xl mx-auto mt-6" onsubmit={() => create()}>
  <Heading
    tag="h1"
    class="mb-4"
    customSize="text-2xl font-extrabold  md:text-3xl lg:text-4xl">New</Heading
  >

  <div class="mt-2">
    <Label for="default-input" class="block mb-2">Title and description</Label>
    <Input
      id="default-input"
      placeholder="Title"
      name="title"
      bind:value={form.title}
      required
    />
  </div>
  <Textarea
    {...textAreaProps}
    class="mt-2"
    name="description"
    bind:value={form.description}
    required
  />

  <div class="mt-2">
    <div class="flex flex-row justify-between">
      <Label for="countries">Tags</Label>
      <Helper class="text-sm">
        Suggestions? <a
          href="https://github.com/wulffZ/sharefiles"
          class="font-medium text-primary-600 hover:underline dark:text-primary-500"
          >Github</a
        >
      </Helper>
    </div>
    <Input
      type="text"
      placeholder="Add tags (comma separated)"
      name="tags"
      class="mt-2"
      bind:value={tagInput}
      on:keydown={(e) => {
        if (tagInput.length > 11) {
          if (
            e.key !== "Backspace" &&
            e.key !== "Enter" &&
            e.key !== "," &&
            e.key !== "ArrowLeft" &&
            e.key !== "ArrowRight"
          ) {
            e.preventDefault();
          }
        }
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();
          const newTag = tagInput.trim().toUpperCase();
          if (newTag && !selectedTags.includes(newTag)) {
            selectedTags = [...selectedTags, newTag];
            tagInput = "";
          }
        }
      }}
    />
    {#if selectedTags.length > 0}
      <div class="flex flex-wrap gap-2 mt-2">
        {#each selectedTags as tag}
          <Badge>
            {tag}
            <button
              tabindex="-1"
              class="ml-1"
              onclick={() => {
                selectedTags = selectedTags.filter((t) => t !== tag);
              }}
            >
              ×
            </button>
          </Badge>
        {/each}
      </div>
    {/if}
  </div>

  <div class="mt-2">
    <Label class="py-2" for="file">Large file input</Label>
    <Fileupload id="file" name="file" size="lg" bind:files={file} required />
  </div>

  {#if progress > 0}
    <div class="mt-4">
      <Progressbar {progress} color="primary" />
      <p
        class="mt-2 font-medium text-primary-600 hover:underline dark:text-primary-500"
      >
        {Math.round(progress)}%
      </p>
    </div>
  {/if}

  <Hr classHr="w-96 h-1 mx-auto my-4 rounded md:my-8" />

  <div class="flex flex-row justify-end mt-4">
    {#if progress > 0}
      <Button disabled type="submit">Uploading...</Button>
    {:else}
      <Button type="submit">Submit</Button>
    {/if}
  </div>

  {#if error}
    <Error {error} />
  {/if}
</form>
