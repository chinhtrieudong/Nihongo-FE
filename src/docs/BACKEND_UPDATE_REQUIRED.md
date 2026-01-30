# Backend Update Required: Remove userId Validation

## Issue
Backend vẫn đang yêu cầu `userId` trong request body cho endpoint `POST /api/v1/lessons/{lessonId}/complete`, trong khi frontend đã được cập nhật để không gửi userId nữa.

## Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "type": "field",
      "msg": "User ID is required",
      "path": "userId",
      "location": "body"
    }
  ]
}
```

## Required Backend Changes

### 1. Update Complete Lesson Endpoint
**Endpoint:** `POST /api/v1/lessons/{lessonId}/complete`

**Current Validation (NEEDS TO BE REMOVED):**
```javascript
// Remove this validation
body('userId').notEmpty().withMessage('User ID is required')
```

**New Implementation:**
```javascript
// Get userId from JWT token instead of request body
const completeLesson = async (req, res) => {
  try {
    // Get userId from JWT token (already authenticated)
    const userId = req.user.id;
    const { lessonId } = req.params;
    
    // Rest of your logic...
    const result = await LessonProgressService.completeLesson(userId, lessonId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### 2. Update Update Progress Endpoint
**Endpoint:** `PUT /api/v1/lessons/{lessonId}/progress`

**Current Validation (NEEDS TO BE REMOVED):**
```javascript
// Remove this validation
body('userId').notEmpty().withMessage('User ID is required')
```

**New Implementation:**
```javascript
const updateLessonProgress = async (req, res) => {
  try {
    // Get userId from JWT token
    const userId = req.user.id;
    const { lessonId } = req.params;
    const progressData = req.body; // status, progress, etc.
    
    // Rest of your logic...
    const result = await LessonProgressService.updateProgress(userId, lessonId, progressData);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### 3. Update Submit Exercise Endpoint
**Endpoint:** `POST /api/v1/lessons/{lessonId}/exercises/{exerciseId}/submit`

**Current Validation (NEEDS TO BE REMOVED):**
```javascript
// Remove this validation
body('userId').notEmpty().withMessage('User ID is required')
```

**New Implementation:**
```javascript
const submitExercise = async (req, res) => {
  try {
    // Get userId from JWT token
    const userId = req.user.id;
    const { lessonId, exerciseId } = req.params;
    const { answer } = req.body;
    
    // Rest of your logic...
    const result = await ExerciseService.submitAnswer(userId, lessonId, exerciseId, answer);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

## Frontend Status ✅
Frontend đã được cập nhật hoàn toàn:
- ✅ Không gửi userId trong request body
- ✅ Sử dụng JWT token qua Authorization header
- ✅ Axios interceptor tự động thêm token
- ✅ Documentation đã cập nhật

## Expected Request Headers
```http
POST /api/v1/lessons/69789d45dd2504d4a2c58cf0/complete
Content-Type: application/json
Authorization: Bearer <jwt_token>

// Empty body or {}
{}
```

## Migration Steps

### Step 1: Update Validation Rules
Remove all `userId` validation from these endpoints:
- `POST /api/v1/lessons/{lessonId}/complete`
- `PUT /api/v1/lessons/{lessonId}/progress`
- `POST /api/v1/lessons/{lessonId}/exercises/{exerciseId}/submit`

### Step 2: Update Controller Logic
Change from:
```javascript
const userId = req.body.userId;
```

To:
```javascript
const userId = req.user.id; // From JWT token
```

### Step 3: Test Endpoints
```bash
# Test complete lesson (should work without userId in body)
curl -X POST http://localhost:3000/api/v1/lessons/69789d45dd2504d4a2c58cf0/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{}'

# Test update progress (should work without userId in body)
curl -X PUT http://localhost:3000/api/v1/lessons/69789d45dd2504d4a2c58cf0/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{"status": "completed", "progress": 100}'
```

## Security Benefits
- ✅ No more userId manipulation in requests
- ✅ User identification handled securely by JWT
- ✅ Cleaner API design
- ✅ Consistent with modern authentication patterns

## Files to Update
1. **Routes:** Remove userId validation from route definitions
2. **Controllers:** Update to use `req.user.id` instead of `req.body.userId`
3. **Validation:** Remove userId from validation schemas
4. **Tests:** Update test cases to not include userId in request body

## Timeline
- **Immediate:** Required for frontend to work properly
- **Priority:** HIGH - Blocking core functionality
- **Impact:** All lesson completion features

Please update the backend as soon as possible to restore functionality!
