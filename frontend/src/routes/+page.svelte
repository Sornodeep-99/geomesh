<script lang="ts">
  import { onMount } from 'svelte';
  import { posts } from '$lib/stores'; // Import our store
  import { env } from '$env/dynamic/public'; // <-- Add this line

  let isLoading = true;
  let error: string | null = null;
  let newPostContent = ''; // Variable to hold the content of the new post

  const API_URL = env.PUBLIC_API_URL || 'http://localhost:3000';
  const WEBSOCKET_URL = 'ws://localhost:3000';

  // This function runs when the component is first added to the page
  onMount(() => {
    // --- 1. Connect to WebSocket Server ---
    const socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => console.log('WebSocket connection established');
    socket.onerror = (err) => console.error('WebSocket error:', err);

    // Listen for messages from the server
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'NEW_POST') {
        // Add the new post to the top of our list in real-time
        posts.update(currentPosts => [message.payload, ...currentPosts]);
      }
    };

    // --- 2. Fetch Initial Posts ---
    if (!navigator.geolocation) {
      error = 'Geolocation is not supported by your browser.';
      isLoading = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`${API_URL}/api/posts?latitude=${latitude}&longitude=${longitude}&radius=5000`);
          if (!response.ok) throw new Error('Failed to fetch posts.');

          posts.set(await response.json());
        } catch (e) {
          error = e.message;
        } finally {
          isLoading = false;
        }
      },
      () => {
        error = 'Unable to retrieve your location.';
        isLoading = false;
      }
    );
  });

  // This function handles the form submission
  async function createPost() {
    if (!newPostContent.trim()) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent,
          userId: 'web-user', // A temporary user id
          expiresInMinutes: 60,
          latitude,
          longitude,
        }),
      });

      if (response.ok) {
        newPostContent = ''; // Clear the input field on success
      } else {
        alert('Failed to create post.');
      }
    });
  }
</script>

<main style="font-family: sans-serif; padding: 2em; max-width: 600px; margin: auto;">
  <h1>GeoMesh</h1>

  <form on:submit|preventDefault={createPost} style="margin-bottom: 2em;">
    <textarea 
      bind:value={newPostContent}
      placeholder="What's on your mind?" 
      style="width: 100%; min-height: 60px; padding: 0.5em;"
    ></textarea>
    <button type="submit" style="width: 100%; padding: 0.75em; font-weight: bold;">Post</button>
  </form>

  <h2>Nearby Posts</h2>

  {#if isLoading}
    <p>Getting your location and fetching nearby posts...</p>
  {:else if error}
    <p style="color: red;">Error: {error}</p>
  {:else}
    <ul style="padding: 0;">
      {#each $posts as post (post.id)}
        <li style="border: 1px solid #ccc; border-radius: 4px; padding: 1em; margin-bottom: 1em; list-style: none;">
          <p>{post.content}</p>
          <small>Posted by: {post.user_id} | {Math.round(post.distance_meters)} meters away</small>
        </li>
      {:else}
        <p>No posts found nearby. Be the first to create one!</p>
      {/each}
    </ul>
  {/if}
</main>