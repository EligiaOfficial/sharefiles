# sharefiles

uploading anything you need, powered by svelte.

## Run in Development

1. Edit the .env.example file to .env and change the values to your own if needed.
2. Use docker-compose for development:

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. The application will be available at `http://localhost:5173`
4. PocketBase admin panel at `http://localhost:8090/_/`

## Run in Produciton

1. Build and run the production stack:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. The application will be available at `http://localhost:3000`
3. PocketBase admin panel at `http://localhost:8090/_/`

## Environment Variables

For production, you may want to set these environment variables in the compose file:

- `NODE_ENV=production`
- `PUBLIC_POCKETBASE_URL` - URL to your PocketBase instance

## Pocketbase Setup

Visit `http://localhost:8090/_/` where you will be greeted with a register screen.

1. Create a super user account by opening the creation url on first boot.
   - You can find it by using `docker logs sharefiles-pocketbase`
2. Import pb_schema.json from the repo.
3. Go to the invites collection and create a new record.
   With this you can create your first user.

## Issues

If you encounter any issues, or have general feedback for the application, you can create an issue

Please structure them properly, and include logs or steps to reproduce.
