<script>
  import {
    DarkMode,
    Input,
    Navbar,
    NavBrand,
    NavHamburger,
    NavLi,
    NavUl,
    Spinner,
    Dropdown,
    DropdownItem
  } from "flowbite-svelte";
  import { currentUser, pb } from "$lib/stores/pocketbase";
  import { onMount } from "svelte";
  import { searchQuery } from "$lib/stores/search";
  import { SearchOutline } from "flowbite-svelte-icons";

  let loading = $state(true);

  onMount(() => {
    return currentUser.subscribe(() => {
      loading = false;
    });
  });

  async function sendResetPassword() {
    try {
      await pb.collection('users').requestPasswordReset($currentUser.email);
      console.log('Password reset email sent!');
    } catch (error) {
      console.error('Error:', error);
    }
  }
</script>

{#if loading}
  <div class="flex items-center justify-center h-screen">
    <Spinner class="w-20 h-20" color="primary" />
  </div>
{:else if $currentUser}
  <Navbar
    color="form"
    class="xl:rounded-lg xl:mt-4 flex items-center justify-between px-4"
  >
    <div class="flex items-center gap-2">
      <NavBrand href="/" class="ml-2 mb-1">
        <button
          onclick={() => {
            $searchQuery = "";
          }}
          class="self-center whitespace-nowrap text-2xl font-semibold dark:text-white"
        >
          Sharefiles
        </button>
      </NavBrand>
    </div>

    <div class="flex items-center gap-4 xl:ml-auto">
      <!-- Desktop search bar -->
      <div class="relative hidden xl:block">
        <Input
          id="search-navbar"
          class="max-h-10 w-64 dark:bg-gray-700 pr-10"
          placeholder="Search..."
          name="query"
          bind:value={$searchQuery}
        />
        <SearchOutline
          class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
      </div>
    </div>

    <NavHamburger />

    <!-- Nav Links -->
    <NavUl>
      <NavLi
        href="/"
        on:click={() => {
          $searchQuery = "";
        }}>Dash</NavLi
      >
      <NavLi href="/new">New</NavLi>
      <NavLi href="/invite">Invite</NavLi>
      <NavLi class="cursor-pointer">
        Account
      </NavLi>
      <Dropdown>
        <DropdownItem on:click={sendResetPassword}>Send reset password mail</DropdownItem>
        <DropdownItem href="/"
                      on:click={() => {
          pb.authStore.clear();
          $searchQuery = "";
          window.location.href = "/login";
        }}>Sign out</DropdownItem>
      </Dropdown>
    </NavUl>
    <DarkMode class="p-2 hidden xl:inline-flex" size="lg" />

    <!-- Mobile search bar -->
    <div class="flex xl:hidden w-full mt-2">
      <Input
        id="search-navbar"
        class="w-full max-h-10 dark:bg-gray-700"
        placeholder="Search..."
        name="query"
        bind:value={$searchQuery}
      />

      <DarkMode class="p-2" size="lg" />
    </div>
  </Navbar>
{:else}
  <Navbar
    color="form"
    class="xl:rounded-lg xl:mt-4 flex items-center justify-between px-4"
  >
    <NavBrand class="ml-2 mb-1">
      <span
        class="self-center whitespace-nowrap text-2xl font-semibold dark:text-white"
      >
        Sharefiles
      </span>
    </NavBrand>
    <NavUl>
      <!-- Colour switch -->
      <DarkMode class="p-0" size="lg" />
    </NavUl>
  </Navbar>
{/if}
