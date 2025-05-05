<script lang="ts">
  import { currentUser, pb } from "$lib/stores/pocketbase";
  import { env } from "$env/dynamic/public";
  import { goto, pushState } from "$app/navigation";
  import { createEventDispatcher } from "svelte";

  import { Modal, Button, Badge, Hr } from "flowbite-svelte";
  import {
    DownloadOutline,
    TrashBinOutline,
    PenNibOutline,
    UserAddOutline,
    ExclamationCircleOutline,
    LinkOutline,
  } from "flowbite-svelte-icons";
  import Error from "./Error.svelte";
  import { v4 as uuidv4 } from "uuid";
  import { determineFileType } from "$lib/utils/fileUtils";

  let {
    post,
    isOpen = $bindable(),
    fileUrl = `${env.PUBLIC_POCKETBASE_URL}/api/files/${post.collectionId}/${post.id}/${post.file}`,
  } = $props();
  let dispatch = createEventDispatcher();

  let isOwner = $state(post.user_id === $currentUser?.id);
  let confirmDelete = $state(false);
  let error = $state("");
  let isLoading = $state(true);
  let fileType = $state("");
  let fileContent = $state("");

  $effect(() => {
    if (isOpen) {
      isLoading = true;
      determineFileType(post.file, fileUrl).then((result) => {
        fileType = result.fileType;
        if (result.fileContent) fileContent = result.fileContent;
        isLoading = false;
      });
    }
  });

  function closeModal() {
    isOpen = false;
    pushState(window.location.pathname, {});
  }

  async function remove() {
    try {
      await pb.collection("posts").delete(post.id);

      closeModal();
      dispatch("delete");
    } catch (err: any) {
      error =
        err?.response.message ||
        "An unexpected error occurred. Please check the console and report.";
    }
  }

  function download() {
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = post.file;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => {
        // fallback: open in new tab if download fails
        window.open(fileUrl, '_blank');
      });
  }

  async function publicLink() {
    try {
      const uuid = uuidv4();
      const formData = new FormData();

      formData.append("slug", uuid);
      formData.append("post_id", post.id);
      formData.append("user_id", $currentUser?.id ?? "Unknown");

      await pb.collection("publicLinks").create(formData);

      return goto("/public/" + uuid);
    } catch (err: any) {
      error =
        err?.response.message ||
        "An unexpected error occurred. Please check the console and report.";
    }
  }
</script>

<Modal
  title={post.title}
  bind:open={isOpen}
  autoclose
  outsideclose
  on:close={closeModal}
>
  <svelte:fragment slot="header">
    <div class="flex flex-col justify-between">
      <h3 class="text-xl font-medium text-gray-900 dark:text-white">
        {post.title}
      </h3>
      <i><p class="text-xs text-gray-600 mt-1">{post.file}</p></i>
    </div>
  </svelte:fragment>
  <div class="space-y-4">
    <div class="flex flex-row justify-between">
      <div class="">
        <p>{post.description}</p>
      </div>
      <div class="flex flex-row">
        <UserAddOutline class="w-6 h-6" />
        <p class="text-sm ml-1">
          {post.expand?.user_id?.name ?? "Unknown"}
        </p>
      </div>
    </div>

    {#if isLoading}
      <div class="flex justify-center py-4">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
        ></div>
      </div>
    {:else}
        {#if fileType === "image"}
          <div class="border rounded-lg overflow-hidden hover:scale-150 transition-all duration-300">
            <img
              src={fileUrl}
              alt={post.file}
              class="max-h-96 mx-auto object-contain"
            />
          </div>
        {:else if fileType === "pdf"}
          <div class="border rounded-lg overflow-hidden">
            <iframe title="PDF Preview" src={fileUrl} class="w-full h-96"
            ></iframe>
          </div>
        {:else if fileType === "video"}
          <div class="border rounded-lg overflow-hidden">
            <video controls class="w-full max-h-96">
              <source src={fileUrl} type="video/{post.file.split('.').pop()}" />
              <track kind="captions" label="English" srclang="en" />
              Your browser does not support the video tag.
            </video>
          </div>
        {:else if fileType === "text"}
          <div class="border rounded-lg overflow-hidden">
            <pre class="p-4 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
              <code>{fileContent}</code>
            </pre>
          </div>
        {:else if fileType === "audio"}
          <div class="border rounded-lg overflow-hidden">
            <audio controls class="w-full">
              <source src={fileUrl} type="audio/{post.file.split('.').pop()}" />
              Your browser does not support the audio element.
            </audio>
          </div>
        {:else}
          <div class="border rounded-lg overflow-hidden">
            <div class="flex justify-center items-center h-full text-center my-4">
              <p>
                File type <strong>{post.file.split(".").pop()}</strong> not
                supported for preview.
                <br />
                Download to view.
              </p>
            </div>
          </div>
        {/if}
    {/if}

    <div class="flex justify-between items-center">
      <div class="flex flex-wrap gap-2">
        {#each post.tags as tag}
          <Badge>{tag.toUpperCase()}</Badge>
        {/each}
      </div>

      <div class="w-2/5 text-sm text-gray-500 text-right">
        <p>Created: {new Date(post.created).toLocaleDateString()}</p>
        <p>Updated: {new Date(post.updated).toLocaleDateString()}</p>
      </div>
    </div>
  </div>

  <svelte:fragment slot="footer">
    <div class="flex justify-between items-center w-full">
      {#if isOwner}
        <div class="flex flex-row gap-2">
          <Button color="red" on:click={() => (confirmDelete = true)}>
            <TrashBinOutline class="w-6 h-6" />
          </Button>

          <Button color="green" on:click={() => goto("edit/" + post.id)}>
            <PenNibOutline class="w-6 h-6" />
          </Button>

          <Button color="light" on:click={publicLink}>
            <LinkOutline class="w-6 h-6" />
          </Button>
        </div>
      {/if}

      <div class="flex flex-row">
        <Button class="ml-4" on:click={download}>
          <DownloadOutline class="w-6 h-6" />
        </Button>
      </div>
    </div>
  </svelte:fragment>
</Modal>

<Modal bind:open={confirmDelete} size="xs" class="border-2" autoclose>
  <div class="text-center">
    <ExclamationCircleOutline
      class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
    />
    <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
      Are you sure?
    </h3>
    <Button color="red" class="me-2" on:click={remove}>Yes, I'm sure</Button>
    <Button color="alternative">No, cancel</Button>
  </div>
</Modal>

{#if error}
  <Error {error} />
{/if}
