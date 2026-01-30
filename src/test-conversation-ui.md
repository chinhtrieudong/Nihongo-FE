# Conversation UI Testing Checklist

## 🧪 Manual Testing Steps

### 1. Trang Conversation Loading
- [ ] Navigate to `/conversation` route
- [ ] Check if page loads without errors
- [ ] Check console for any JavaScript errors
- [ ] Verify tabs are visible: "AI Vai diễn", "Hội thoại mẫu", "Luyện tập giọng nói"

### 2. Tab "AI Vai diễn"
- [ ] Left panel shows "Chọn tình huống" card
- [ ] Difficulty selector works (Dễ, Trung bình, Khó)
- [ ] Loading state shows spinner when loading scenarios
- [ ] Empty state shows message when no scenarios
- [ ] Error state shows appropriate error message
- [ ] Right panel shows "Hội thoại" card
- [ ] Empty chat shows placeholder message
- [ ] Input field and Send button are disabled when no conversation

### 3. Tab "Hội thoại mẫu"
- [ ] Left panel shows "Hội thoại có sẵn" card
- [ ] Loading state shows spinner when loading dialogs
- [ ] Empty state shows message when no dialogs
- [ ] Error state shows appropriate error message
- [ ] Right panel shows placeholder when no dialog selected
- [ ] Dialog selection works and shows content
- [ ] Navigation buttons (Trước đó/Tiếp theo) work correctly

### 4. Tab "Luyện tập giọng nói"
- [ ] Shows recording interface
- [ ] "Bắt đầu ghi âm" button works
- [ ] "Dừng ghi âm" button appears when recording
- [ ] Voice analysis results display correctly

### 5. API Testing (Console)
Run these commands in browser console:

```javascript
// Check if conversationAPI is available
console.log('conversationAPI:', typeof conversationAPI !== 'undefined' ? '✅ Available' : '❌ Not available');

// Check token
console.log('Token:', localStorage.getItem('token') ? '✅ Available' : '❌ Not found');

// Test API calls
import('./services/conversationAPI.js').then(({ conversationAPI }) => {
  conversationAPI.getScenarios({ level: 'N5', limit: 5 })
    .then(response => console.log('✅ Scenarios API:', response))
    .catch(error => console.log('❌ Scenarios API Error:', error.message));
    
  conversationAPI.getDialogs({ level: 'N5', limit: 5 })
    .then(response => console.log('✅ Dialogs API:', response))
    .catch(error => console.log('❌ Dialogs API Error:', error.message));
});
```

### 6. Expected Console Logs
When page loads, you should see:
- `✅ Scenarios loaded: X items` (or error message)
- `✅ Dialogs loaded: X items` (or error message)

### 7. Network Tab Check
- [ ] Open DevTools > Network tab
- [ ] Look for requests to `localhost:3000/api/v1/conversation`
- [ ] Check if requests are being made
- [ ] Verify request headers include Authorization if token exists

## 🐛 Common Issues & Solutions

### Issue: "Không thể kết nối đến server"
**Cause:** Backend not running on localhost:3000
**Solution:** Start backend server

### Issue: "Phiên đăng nhập hết hạn"
**Cause:** Token missing or expired
**Solution:** Login again to get fresh token

### Issue: Empty lists with no error
**Cause:** API returns empty arrays
**Solution:** Check backend data or add mock data

### Issue: TypeScript errors
**Cause:** Type mismatches
**Solution:** Check console for specific errors

## 📊 Expected Behavior

### With Backend Running:
- Scenarios and dialogs load from API
- Can select scenarios and start conversations
- All features work as intended

### Without Backend:
- Shows appropriate error messages
- UI remains functional with empty states
- Clear feedback about connection issues

## 🎯 Success Criteria
- [ ] Page loads without JavaScript errors
- [ ] All tabs render correctly
- [ ] Loading states work
- [ ] Empty states show helpful messages
- [ ] Error handling provides clear feedback
- [ ] Console shows meaningful logs
- [ ] API calls are attempted (if backend available)
