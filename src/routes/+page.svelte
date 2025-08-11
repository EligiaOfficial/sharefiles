<script lang="ts">
  import { pb } from "$lib/stores/pocketbase";
  import Post from "../components/Post.svelte";
  import { searchQuery } from "$lib/stores/search";
  import { onMount, onDestroy } from "svelte";

  import { Heading, P, Spinner } from "flowbite-svelte";

  let debouncedTimeout: number;
  let posts = $state({ items: [] });
  let loading = $state(false);
  let unsubscribeSearchQuery: () => void;

  async function get(query: string) {
    try {
      loading = true;

      if (query) {
        posts = await pb.collection("posts").getList(1, 50, {
          filter: `(title?~"${query}" || description?~"${query}" || tags?~"${query}")`,
          expand: "user_id",
          sort: "-updated",
        });
      } else {
        posts = await pb.collection("posts").getList(1, 50, {
          expand: "user_id",
          sort: "-updated",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      posts = { items: [] };
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loading = true;

    unsubscribeSearchQuery = searchQuery.subscribe((query) => {
      if (debouncedTimeout) clearTimeout(debouncedTimeout);

      debouncedTimeout = setTimeout(() => {
        get(query);
      }, 500);
    });

    if (!searchQuery) {
      get("");
    }
  });

  onDestroy(() => {
    if (debouncedTimeout) clearTimeout(debouncedTimeout);
    if (unsubscribeSearchQuery) unsubscribeSearchQuery();
  });
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<main class="flex justify-center items-center flex-col mx-auto mt-4">
  <ul
    class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 m-2 gap-6"
  >
    {#if loading}
      <div class="flex justify-center items-center col-span-full">
        <Spinner size="w-10 h-10 m-10 ease-in" />
      </div>
    {:else if posts && posts.items.length > 0}
      {#each posts.items as post}
        <Post {post} on:delete={() => get("")} />
      {/each}
    {:else}
      <div class="flex flex-col">
        <Heading tag="h2" customSize="text-4xl font-extrabold">
          No results <span class="text-orange-500">:(</span>
        </Heading>
        <P class="my-4 text-gray-500"
          >Try searching for keywords in the title, description, or tags.</P
        >
      </div>
    {/if}
  </ul>
</main>
