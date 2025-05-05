<script lang="ts">
  import { Button, Hr, Input, Label } from "flowbite-svelte";
  import { pb } from "$lib/stores/pocketbase";
  import { goto } from "$app/navigation";
  import Error from "../../components/Error.svelte";

  let invite = null;
  let inviteCode = $state("");
  let error = $state("");

  let form = $state({
    email: "",
    name: "",
    password: "",
    passwordConfirm: "",
  });

  async function register(event: SubmitEvent) {
    event.preventDefault();

    try {
      invite = await pb
        .collection("invites")
        .getFirstListItem(`code="${inviteCode}"`);
    } catch (err: any) {
      return (error = "Invalid invite code.");
    }

    if (invite.expired === true) {
      return (error = "Invite code has expired.");
    }

    try {
      // Register
      await pb.collection("users").create(form);

      // Log in
      await pb.collection("users").authWithPassword(form.email, form.password);

      const updatedInvite = {
        code: invite.code,
        expired: true,
      };

      await pb.collection("invites").update(invite.id, updatedInvite);

      return await goto("/");
    } catch (err: any) {
      return (error = err?.response);
    }
  }
</script>

<svelte:head>
  <title>Register</title>
</svelte:head>

<form class="max-w-xl mx-auto mt-6" onsubmit={register}>
  <p
    class="tracking-tight leading-none text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
  >
    Welcome to sharefiles!
  </p>

  <div class="mt-2">
    <Label for="default-input" class="block mb-2">Name and email</Label>
    <Input
      id="default-input"
      placeholder="Name"
      bind:value={form.name}
      name="name"
      required
    />
    <Input
      id="default-input"
      placeholder="Email"
      bind:value={form.email}
      name="email"
      class="mt-2"
      required
    />
  </div>

  <Hr classHr="w-96 h-1 mx-auto my-4 rounded md:my-8" />

  <div class="mt-2">
    <Label for="default-input" class="block mb-2"
      >Password and invite code</Label
    >
    <Input
      id="default-input"
      placeholder="Password"
      bind:value={form.password}
      name="password"
      type="password"
      required
    />
    <Input
      id="default-input"
      class="mt-2"
      placeholder="Confirm password"
      bind:value={form.passwordConfirm}
      name="passwordConfirm"
      type="password"
      required
    />
    <Input
      id="default-input"
      class="mt-2"
      placeholder="Invite code"
      bind:value={inviteCode}
      name="invite"
      type="text"
      required
    />
  </div>

  <div class="flex flex-row justify-between mt-4">
    <button class="text-gray-900 dark:text-white" onclick={() => goto("/login")}
      >Log in <span
        class="underline text-primary-700 hover:text-primary-800 dark:text-primary-600 dark:hover:text-primary-700 dark:text-white"
        >instead.</span
      >
    </button>
    <Button type="submit" formaction="?/create">Register</Button>
  </div>

  {#if error}
    <Error {error} />
  {/if}
</form>
