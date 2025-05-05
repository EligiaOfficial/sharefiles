<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { Badge, Button, Card, Spinner } from "flowbite-svelte";
  import { goto } from "$app/navigation";
  import {
    DownloadOutline,
    LinkOutline,
    PenNibOutline,
    TrashBinOutline,
    UserAddOutline,
  } from "flowbite-svelte-icons";
  import { env } from "$env/dynamic/public";
  import { pb } from "$lib/stores/pocketbase";
  import { determineFileType } from "$lib/utils/fileUtils";
  import NotFound from "../../../components/NotFound.svelte";

  let { post, publicLink, slug = $page.params.slug, fileUrl } = $props();
  let error = $state("");
  let loading = $state(false);
  let fileType = $state("");
  let fileContent = $state("");

  onMount(() => {
    loading = true;

    get();
  });

  async function get() {
    // Fetch publicLink record
    try {
      publicLink = await pb
        .collection("publicLinks")
        .getFirstListItem(`slug="${slug}"`);
    } catch (err: any) {
      error =
        err?.message ||
        "An unexpected error occurred. Please check the console and report.";
    }

    // Fetch actual post
    try {
      post = await pb.collection("posts").getOne(publicLink.post_id);

      fileUrl = `${env.PUBLIC_POCKETBASE_URL}/api/files/${post.collectionId}/${post.id}/${post.file}`;

      const result = await determineFileType(post.file, fileUrl);
      fileType = result.fileType;
      fileContent = result.fileContent || "";
    } catch (err: any) {
      error =
        err?.message ||
        "An unexpected error occurred. Please check the console and report.";
    }

    loading = false;
  }

  function download() {
    window.open(fileUrl, "_blank");
  }
</script>

<main class="flex justify-center items-center mt-6">
  {#if loading}
    <div class="flex justify-center items-center col-span-full">
      <Spinner size="w-10 h-10 m-10 ease-in" />
    </div>
  {:else if post}
    <Card size="lg" padding="xl">
      <div class="flex flex-col justify-between">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">
          {post.title}
        </h3>
        <i><p class="text-xs text-gray-600 mt-1">{post.file}</p></i>
      </div>

      <div class="space-y-4 mt-4">
        <hr />
        <div class="flex flex-row justify-between">
          <div>
            <p>{post.description}</p>
          </div>
          <div class="flex flex-row">
            <UserAddOutline class="w-6 h-6" />
            <p class="text-sm ml-1">
              {post.expand?.user_id?.name ?? "Unknown"}
            </p>
          </div>
        </div>

        <div class="border rounded-lg overflow-hidden">
          {#if fileType === "image"}
            <img
              src={fileUrl}
              alt={post.file}
              class="max-h-96 mx-auto object-contain"
            />
          {:else if fileType === "pdf"}
            <iframe title="PDF Preview" src={fileUrl} class="w-full h-96"
            ></iframe>
          {:else if fileType === "video"}
            <video controls class="w-full max-h-96">
              <source src={fileUrl} type="video/{post.file.split('.').pop()}" />
              <track kind="captions" label="English" srclang="en" />
              Your browser does not support the video tag.
            </video>
          {:else if fileType === "text"}
            <pre class="p-4 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
              <code>{fileContent}</code>
            </pre>
          {:else if fileType === "audio"}
            <audio controls class="w-full">
              <source src={fileUrl} type="audio/{post.file.split('.').pop()}" />
              Your browser does not support the audio element.
            </audio>
          {:else}
            <div
              class="flex justify-center items-center h-full text-center my-4"
            >
              <p>
                File type <strong>{post.file.split(".").pop()}</strong> not
                supported for preview.
                <br />
                Download to view.
              </p>
            </div>
          {/if}
        </div>

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

        <div class="flex justify-end">
          <Button class="ml-4" on:click={download}>
            <DownloadOutline class="w-6 h-6" />
          </Button>
        </div>
      </div>
    </Card>
  {:else}
    <NotFound />
  {/if}
</main>
