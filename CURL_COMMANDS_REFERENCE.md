# CURL Commands for Testing Database Models

Base URL: `http://localhost:3000/api`

## Users

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gabriela Mendoza",
    "email": "gabriela.mendoza@gmail.com"
  }'
```

### Get All Users
```bash
curl http://localhost:3000/api/users
```

### Get User by ID
```bash
curl "http://localhost:3000/api/users?id=USER_ID_HERE"
```

### Update User
```bash
curl -X PUT "http://localhost:3000/api/users?id=USER_ID_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "updated@email.com"
  }'
```

### Delete User
```bash
curl -X DELETE "http://localhost:3000/api/users?id=USER_ID_HERE"
```

## Messages

### Create Message (requires valid authorId)
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": "USER_ID_HERE",
    "text": "Example comment 1",
    "likedBy": [],
    "dislikedBy": []
  }'
```

### Get All Messages
```bash
curl http://localhost:3000/api/messages
```

### Get Message by ID
```bash
curl "http://localhost:3000/api/messages?id=MESSAGE_ID_HERE"
```

### Get Message by ID (with user name and image populated)
```bash
# First, get all messages to find a message ID
curl http://localhost:3000/api/messages

# Then use one of the _id values from the response to get a specific message
# Example: Get message with populated author name and image
curl "http://localhost:3000/api/messages?id=MESSAGE_ID_HERE"
```

Example workflow to get a seeded message:
```bash
# Get all messages and extract the first message ID
MESSAGE_RESPONSE=$(curl -s http://localhost:3000/api/messages)
MESSAGE_ID=$(echo $MESSAGE_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Message ID: $MESSAGE_ID"

# Get the specific message with populated user data
curl "http://localhost:3000/api/messages?id=$MESSAGE_ID"
```

### Update Message
```bash
curl -X PUT "http://localhost:3000/api/messages?id=MESSAGE_ID_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Updated text",
    "likedBy": ["USER_ID_1", "USER_ID_2"]
  }'
```

### Delete Message
```bash
curl -X DELETE "http://localhost:3000/api/messages?id=MESSAGE_ID_HERE"
```

## Communities

### Create Community
```bash
curl -X POST http://localhost:3000/api/communities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example Community",
    "description": "A community of the day",
    "location": {
      "point": {
        "type": "Point",
        "coordinates": [-74.006, 40.7128]
      },
      "radius": 1000
    },
    "tags": ["community", "day"],
    "members": []
  }'
```

### Get All Communities
```bash
curl http://localhost:3000/api/communities
```

### Get Community by ID
```bash
curl "http://localhost:3000/api/communities?id=COMMUNITY_ID_HERE"
```

### Update Community
```bash
curl -X PUT "http://localhost:3000/api/communities?id=COMMUNITY_ID_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Community Name",
    "tags": ["updated", "tags"]
  }'
```

### Delete Community
```bash
curl -X DELETE "http://localhost:3000/api/communities?id=COMMUNITY_ID_HERE"
```

## Tips

### Create Tip Pin
```bash
curl -X POST http://localhost:3000/api/tips \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pin",
    "communityId": "COMMUNITY_ID_HERE",
    "title": "Pin of the Day",
    "description": "A pin of the day",
    "location": {
      "point": {
        "type": "Point",
        "coordinates": [-74.006, 40.7128]
      },
      "radius": 5
    },
    "comments": [],
    "likedBy": [],
    "dislikedBy": []
  }'
```

### Create Tip Event
```bash
curl -X POST http://localhost:3000/api/tips \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event",
    "communityId": "COMMUNITY_ID_HERE",
    "title": "Event of the Day",
    "description": "An event of the day",
    "startDate": "2024-12-25T10:00:00Z",
    "location": {
      "point": {
        "type": "Point",
        "coordinates": [-74.006, 40.7128]
      },
      "radius": 5
    },
    "comments": [],
    "likedBy": [],
    "dislikedBy": []
  }'
```

### Create Tip Text
```bash
curl -X POST http://localhost:3000/api/tips \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "communityId": "COMMUNITY_ID_HERE",
    "title": "Text of the Day",
    "description": "A text of the day",
    "comments": [],
    "likedBy": [],
    "dislikedBy": []
  }'
```

### Get All Tips
```bash
curl http://localhost:3000/api/tips
```

### Get Tip by ID
```bash
curl "http://localhost:3000/api/tips?id=TIP_ID_HERE"
```

### Update Tip
```bash
curl -X PUT "http://localhost:3000/api/tips?id=TIP_ID_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description"
  }'
```

### Delete Tip
```bash
curl -X DELETE "http://localhost:3000/api/tips?id=TIP_ID_HERE"
```

## Testing Workflow

1. **Create a User** - Save the `_id` from the response
2. **Create a Community** - Save the `_id` from the response
3. **Create a Message** - Use the user `_id` as `authorId`
4. **Create a Tip** - Use the community `_id` as `communityId`
5. **Update relationships** - Add message IDs to tip comments, user IDs to tip likedBy/dislikedBy

Example complete workflow:
```bash
# 1. Create user
USER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}')
USER_ID=$(echo $USER_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "User ID: $USER_ID"

# 2. Create community
COMMUNITY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/communities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Community",
    "description": "Test description",
    "location": {
      "point": {"type": "Point", "coordinates": [-74.006, 40.7128]},
      "radius": 1000
    },
    "tags": ["test"]
  }')
COMMUNITY_ID=$(echo $COMMUNITY_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Community ID: $COMMUNITY_ID"

# 3. Create message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d "{\"authorId\": \"$USER_ID\", \"text\": \"Test message\"}"

# 4. Create tip pin
curl -X POST http://localhost:3000/api/tips \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"pin\",
    \"communityId\": \"$COMMUNITY_ID\",
    \"title\": \"Test Pin\",
    \"description\": \"Test description\",
    \"location\": {
      \"point\": {\"type\": \"Point\", \"coordinates\": [-74.006, 40.7128]},
      \"radius\": 5
    }
  }"
```

