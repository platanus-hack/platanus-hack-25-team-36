# Database Seeding

This folder contains scripts and data files for seeding the database with example data.

## Usage

### Prerequisites

1. Install dependencies (including `dotenv`):
   ```bash
   pnpm install
   ```

2. Set up environment variables. Create a `.env.local` file in the project root with your MongoDB credentials:
   ```env
   MONGODB_USERNAME=your_username
   MONGODB_PASSWORD=your_password
   MONGODB_CLUSTER_NAME=your_cluster_name
   MONGODB_CLUSTER_URL_ID=your_cluster_id  # Optional, if your cluster URL includes an ID
   MONGO_DATABASE_NAME=pasaeldato  # Optional, defaults to "pasaeldato"
   ```

### Running the Seed Script

Run the seed script using:

```bash
pnpm seed
```

Or with npm:

```bash
npm run seed
```

**Note:** The script will automatically load environment variables from `.env.local` or `.env` files.

## Files

- `seed.ts` - Main seeding script that resets the database and loads data from JSON files
- `assets/` - Folder containing JSON data files:
  - `users.json` - User data (required)
  - `communities.json` - Community data (optional)
  - `messages.json` - Message data (optional)
  - `tips.json` - Tip data (optional)

## Data Format

### assets/users.json
Array of user objects with:
- `name` (string, required)
- `email` (string, required, unique)

### assets/communities.json
Array of community objects with:
- `name` (string, required)
- `description` (string, required)
- `location` (object, required) - GeoJSON Point with coordinates [longitude, latitude]
- `tags` (array of strings, optional)
- `colour` (string, optional)
- `members` (array of user emails, optional) - References users by email

### assets/messages.json
Array of message objects with:
- `id` (string, optional) - Custom ID for referencing in tips
- `authorEmail` (string, required) - References user by email
- `text` (string, required)
- `likedBy` (array of user emails, optional)
- `dislikedBy` (array of user emails, optional)

### assets/tips.json
Array of tip objects with:
- `type` (string, required) - One of: "pin", "event", "text"
- `communityName` (string, required) - References community by name
- `title` (string, required)
- `description` (string, required)
- `location` (object, required for "pin" and "event" types) - GeoJSON Point
- `startDate` (ISO date string, required for "event" type)
- `colour` (string, optional, for "pin" type)
- `likedBy` (array of user emails, optional)
- `dislikedBy` (array of user emails, optional)
- `comments` (array of message IDs, optional) - Currently not used in example data

## Notes

- The script will **reset** (delete all data) from the database before seeding
- Users must be seeded first as other models reference them
- Communities reference users by email
- Messages reference users by email
- Tips reference communities by name
- Make sure your MongoDB connection environment variables are set correctly
