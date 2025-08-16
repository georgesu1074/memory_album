# /test-feature

Create test plan and execute testing for a completed feature.

## Usage
```
/test-feature [feature-name]
```

## Examples
```
/test-feature memory-submission
/test-feature ai-categorization
```

## Implementation

### 1. Validation
```
1. Check feature folder exists in /development-docs/
2. Verify all tasks in tasks.md are checked [x]
3. If not all complete, error: "Complete all tasks before testing"
```

### 2. Generate test-plan.md
```markdown
# [Feature Name] Test Plan

## Test Environment
- Device: [Mobile/Desktop]
- Browser: [Chrome/Safari/Firefox]
- Network: [Fast 3G/4G/WiFi]

## Functional Tests

### Test 1: [Primary User Flow]
**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
- [Expected outcome]

**Status:** [ ] Pass [ ] Fail

---

### Test 2: [Edge Case]
**Steps:**
1. [Step 1]
2. [Step 2]

**Expected Result:**
- [Expected outcome]

**Status:** [ ] Pass [ ] Fail

## Mobile Tests
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Tablet (iPad)

## Performance Tests
- [ ] Page loads < 3 seconds
- [ ] No console errors
- [ ] Images optimized

## Error Handling Tests
- [ ] Network failure
- [ ] Invalid input
- [ ] Server error (500)

## Accessibility Tests
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] Color contrast sufficient

## Security Tests
- [ ] Input validation
- [ ] Rate limiting works
- [ ] No sensitive data exposed
```

### 3. Create test-results.md Template
```markdown
# [Feature Name] Test Results

**Date**: [Current date]
**Tester**: [User]
**Environment**: Development

## Summary
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X

## Detailed Results

### ✅ Passing Tests
- Test 1: [Name] - Works as expected
- Test 2: [Name] - No issues

### ❌ Failing Tests
- Test X: [Name]
  - Issue: [Description]
  - Steps to reproduce: [Steps]
  - Screenshot: [If applicable]

### ⚠️ Blocked Tests
- Test Y: [Name]
  - Blocker: [What's preventing test]

## Bugs Found
1. **Bug #1**: [Title]
   - Severity: [Critical/Major/Minor]
   - Description: [Details]
   - Reproduction: [Steps]

## Performance Notes
- Load time: Xs
- Memory usage: XMB
- Network requests: X

## Recommendations
- [Any improvements needed]
- [Design suggestions]

## Sign-off
- [ ] All critical tests pass
- [ ] No blocking bugs
- [ ] Ready for completion
```

### 4. Guide Testing Process
```
1. Output: "Starting test phase for [feature]"
2. Display first test from test-plan.md
3. Prompt: "Execute test and report result (pass/fail/blocked)"
4. Update test-results.md with result
5. Continue through all tests
6. Generate summary
7. If all pass → suggest /complete-feature
8. If failures → list fixes needed
```

## Output Example

```
🧪 Starting test phase for: memory-submission

Generated test-plan.md with 15 test cases:
- 8 Functional tests
- 3 Mobile tests
- 2 Performance tests
- 2 Security tests

Let's begin testing:

Test 1: Submit memory with photo
Steps:
1. Open submission form
2. Select "Both" for memory type
3. Enter name "Test User"
4. Type memory text (100 chars)
5. Upload photo (2MB JPG)
6. Click Submit

Please execute this test and report: (p)ass, (f)ail, or (b)locked

> p

✅ Test 1 passed

Test 2: Character limit validation
...

[After all tests]

📊 Test Summary:
- Total: 15
- Passed: 13 ✅
- Failed: 2 ❌
- Blocked: 0 ⚠️

Failed tests need fixes:
1. Photo upload fails on iOS Safari
2. Character counter shows wrong count

Fix these issues, then run tests again.
Or if non-critical, run /complete-feature with notes.
```

## Test Categories by Feature

### memory-submission
- Form validation
- Photo upload (multiple)
- Character limits
- Memory type selection
- Success confirmation
- Error handling

### ai-categorization
- Matching accuracy
- New memory creation
- Summary generation
- Profanity filtering
- Retry on failure

### memory-album
- Grid layout responsive
- Filter buttons work
- Card animations smooth
- Pagination/scroll
- Photo carousel

## Mobile-Specific Tests
- Touch targets (44px minimum)
- Swipe gestures work
- Keyboard doesn't cover form
- Photos can be taken directly
- Orientation changes handled

## Notes
- Always test on real devices when possible
- Document with screenshots for failures
- Consider network conditions
- Test with real data when safe
- Get user feedback on UX