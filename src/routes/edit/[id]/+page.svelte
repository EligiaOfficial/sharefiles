<script lang="ts">
  import { page } from "$app/stores";
  import { currentUser, pb } from "$lib/stores/pocketbase";

  import Error from "../../../components/Error.svelte";
  import { onMount } from "svelte";
  import {
    Badge,
    Button,
    Fileupload,
    Heading,
    Helper,
    Hr,
    Input,
    Label,
    MultiSelect,
    Progressbar,
    Textarea,
  } from "flowbite-svelte";
  import { env } from "$env/dynamic/public";
  import { goto } from "$app/navigation";
  import NotFound from "../../../components/NotFound.svelte";

  let post_id = $page.params.id;
  let post = null;
  let isOwner = $state(false);

  let progress = $state(0);
  let file = $state<FileList | undefined>(undefined);
  let selectedTags = $state<string[]>([]);
  let tagInput = $state("");
  let error = $state("");

  // Onload get post by id in url
  onMount(() => {
    get();
  });

  // Default values until post is loaded in...
  let form = $state({
    title: "",
    description: "",
  });
  let textAreaProps = $state({
    id: "description",
    name: "description",
    label: "Description",
    rows: 4,
    placeholder: "",
  });

  async function get() {
    try {
      post = await pb.collection("posts").getOne(post_id);

      if (post.user_id === $currentUser?.id) {
        isOwner = true;
      }

      form.title = post.title;
      form.description = post.description;
      textAreaProps.placeholder = post.description;
      selectedTags = post.tags;
    } catch (err: any) {
      error =
        err?.response.message ||
        "An unexpected error occurred. Please check the console and report.";
    }
  }

  async function edit() {
    if (!$currentUser) return;

    const formData = new FormData();

    formData.append("user_id", $currentUser.id);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("tags", JSON.stringify(selectedTags));

    // If none, assume user didn't upload a different file.
    if (file) {
      formData.append("file", file[0]);
    }
    const xhr = new XMLHttpRequest();
    xhr.open(
      "PATCH",
      env.PUBLIC_POCKETBASE_URL + "/api/collections/posts/records/" + post_id,
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
          error = xhr.response;
        }
      };

      xhr.onerror = () => {
        error = xhr.response;
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

{#if isOwner}
  <form class="max-w-xl mx-auto mt-6" onsubmit={edit}>
    <Heading
      tag="h1"
      class="mb-4"
      customSize="text-2xl font-extrabold  md:text-3xl lg:text-4xl"
      >Edit</Heading
    >

    <div class="mt-2">
      <Label for="default-input" class="block mb-2">Title and description</Label
      >
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
      <Fileupload id="file" name="file" size="lg" bind:files={file} />
    </div>

    {#if progress > 0}
      <div class="mt-4">
        <Progressbar {progress} color="primary" />
        <p
          class="mt-2 font-medium text-primary-600 hover:underline dark:text-primary-500"
        >
          {Math.round(progress)}
          %
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
{:else}
  <NotFound />
{/if}
