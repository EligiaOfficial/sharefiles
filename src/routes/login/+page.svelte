<script lang="ts">
  import { Button, Input, Label } from "flowbite-svelte";
  import { goto } from "$app/navigation";
  import { pb } from "$lib/stores/pocketbase";
  import Error from "../../components/Error.svelte";

  let error = $state("");
  let form = {
    email: "",
    password: "",
  };

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    try {
      await pb.collection("users").authWithPassword(form.email, form.password);
      await goto("/");
    } catch (err: any) {
      error =
        err?.response ||
        "An unexpected error occurred. Please check the console and report.";
    }
  }
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<form class="max-w-xl mx-auto mt-6" onsubmit={handleSubmit}>
  <p
    class="tracking-tight leading-none text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
  >
    Welcome back.
  </p>

  <div class="mt-2">
    <Label for="default-input" class="block mb-2">Email and password</Label>
    <Input
      type="email"
      id="default-input"
      placeholder="Email"
      bind:value={form.email}
      name="email"
      required
    />
    <Input
      id="default-input"
      type="password"
      placeholder="Password"
      bind:value={form.password}
      name="password"
      class="mt-2"
      required
    />
  </div>

  <div class="mt-4 flex justify-end">
    <Button type="submit">Log in</Button>
  </div>
</form>

<div class="max-w-xl mx-auto mt-4">
  <a href="/register" class="text-gray-900 dark:text-white">
    No account? <span
      class="underline text-primary-700 hover:text-primary-800 dark:text-primary-600 dark:hover:text-primary-700 dark:text-white"
      >Register.</span
    >
  </a>
</div>

{#if error}
  <Error {error} />
{/if}
