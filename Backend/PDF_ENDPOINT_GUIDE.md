# Quick Start Guide: Multi-Image PDF Upload Endpoint

## New Endpoint: Create PDF from Multiple Images

### Endpoint
```
POST /api/submissions/create-from-images
```

### Purpose
Upload multiple scanned exam paper images and automatically create a single PDF submission.

### Authentication
Requires valid JWT token in Authorization header.

### Request Format

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Body Parameters:**
- `images` (file[], required): Multiple image files (PNG, JPG, JPEG)
- `exam_id` (integer, required): The exam ID
- `student_id` (integer, optional): Student ID (teachers/admins only)

### Example Requests

#### Using cURL
```bash
# Student uploading their own exam
curl -X POST http://localhost:5000/api/submissions/create-from-images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "exam_id=1" \
  -F "images=@page1.jpg" \
  -F "images=@page2.jpg" \
  -F "images=@page3.jpg"

# Teacher uploading on behalf of student
curl -X POST http://localhost:5000/api/submissions/create-from-images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "exam_id=1" \
  -F "student_id=5" \
  -F "images=@page1.jpg" \
  -F "images=@page2.jpg"
```

#### Using Python Requests
```python
import requests

url = 'http://localhost:5000/api/submissions/create-from-images'
headers = {'Authorization': 'Bearer YOUR_JWT_TOKEN'}

files = [
    ('images', open('page1.jpg', 'rb')),
    ('images', open('page2.jpg', 'rb')),
    ('images', open('page3.jpg', 'rb'))
]

data = {'exam_id': 1}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())
```

#### Using JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('exam_id', '1');
formData.append('images', file1); // File objects from input
formData.append('images', file2);
formData.append('images', file3);

fetch('http://localhost:5000/api/submissions/create-from-images', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Success Response (201 Created)
```json
{
  "submission": {
    "id": 123,
    "exam_id": 1,
    "student_id": 5,
    "scanned_paper_path": "submissions/exam1_student5_20251227_a1b2c3d4.pdf",
    "submission_status": "pending",
    "submitted_at": "2025-12-27T10:30:00.123456",
    "page_count": 3,
    "created_at": "2025-12-27T10:30:00.123456",
    "updated_at": "2025-12-27T10:30:00.123456"
  },
  "task_id": "abc123-def456-ghi789",
  "message": "PDF created from 3 image(s) and uploaded successfully. OCR processing has been queued.",
  "status": "success",
  "page_count": 3
}
```

### Error Responses

#### 400 Bad Request - No images provided
```json
{
  "message": "No images uploaded. Please provide at least one image.",
  "status": "error"
}
```

#### 400 Bad Request - Invalid image format
```json
{
  "success": false,
  "error": "Image 2 has invalid type. Only PNG, JPG, and JPEG are allowed for multi-image upload."
}
```

#### 400 Bad Request - Missing exam_id
```json
{
  "message": "exam_id is required",
  "status": "error"
}
```

#### 403 Forbidden - Exam not available
```json
{
  "message": "Exam not available for submission",
  "status": "error"
}
```

#### 409 Conflict - Submission already exists
```json
{
  "message": "Submission already exists for this exam",
  "status": "error",
  "submission": {
    "id": 456,
    "exam_id": 1,
    "student_id": 5,
    ...
  }
}
```

## What Happens After Upload?

1. **PDF Creation**: Images are combined into a single PDF (in order)
2. **Storage**: PDF saved to `uploads/submissions/` with unique filename
3. **Database**: Submission record created with status `pending`
4. **OCR Queue**: Celery task queued for OCR processing
5. **Cleanup**: Temporary image files automatically deleted

## Checking Processing Status

### Get OCR Status
```bash
curl -X GET http://localhost:5000/api/submissions/{submission_id}/ocr-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get OCR Results
```bash
curl -X GET http://localhost:5000/api/submissions/{submission_id}/ocr-results \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Submission Details
```bash
curl -X GET http://localhost:5000/api/submissions/{submission_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Key Features

✅ **Multiple Image Support**: Upload 1 to N images
✅ **Automatic PDF Creation**: Images combined in order
✅ **Secure Processing**: Temporary files cleaned up automatically
✅ **OCR Integration**: Automatic text extraction from PDF
✅ **Multi-page Support**: Each page processed individually
✅ **Error Handling**: Comprehensive validation and cleanup

## Supported Formats

### For Multi-Image Endpoint
- PNG (.png)
- JPEG (.jpg, .jpeg)

### For Regular Submission Endpoint
- PNG (.png)
- JPEG (.jpg, .jpeg)
- PDF (.pdf) - including multi-page PDFs

## Limitations & Constraints

- **Max file size**: 16MB per request (configurable in Flask config)
- **Allowed formats**: PNG, JPG, JPEG only for multi-image endpoint
- **One submission per student per exam**: Duplicate submissions return 409
- **Exam timeframe**: Students can only submit during exam period

## HTML Form Example

```html
<form action="/api/submissions/create-from-images" method="POST" enctype="multipart/form-data">
  <input type="hidden" name="exam_id" value="1">

  <label>Upload Exam Pages:</label>
  <input type="file" name="images" accept="image/png,image/jpeg" multiple required>

  <button type="submit">Submit Exam</button>
</form>
```

**Note**: Add JWT token to form submission headers using JavaScript/Ajax for authenticated requests.

## Best Practices

1. **Image Order**: Upload images in the correct page order
2. **Image Quality**: Use high-resolution scans (300 DPI recommended)
3. **File Size**: Compress images if needed to stay under 16MB total
4. **Format**: Use PNG for best quality, JPEG for smaller size
5. **Validation**: Check response status before assuming success

## Troubleshooting

### "Failed to create PDF"
- Check that all files are valid images
- Verify files aren't corrupted
- Ensure sufficient disk space

### "OCR processing has been queued" but no results
- Verify Celery worker is running
- Check Redis is accessible
- Review Celery logs for errors

### "Submission already exists"
- Student can only submit once per exam
- Delete existing submission or use reprocess endpoint
- Contact admin if submission needs replacement

## Integration with Frontend

### React Example
```jsx
const uploadExam = async (examId, imageFiles) => {
  const formData = new FormData();
  formData.append('exam_id', examId);

  imageFiles.forEach(file => {
    formData.append('images', file);
  });

  const response = await fetch('/api/submissions/create-from-images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getJWTToken()}`
    },
    body: formData
  });

  return await response.json();
};
```

### Vue Example
```javascript
async uploadExam(examId, images) {
  const formData = new FormData();
  formData.append('exam_id', examId);

  images.forEach(image => {
    formData.append('images', image);
  });

  const response = await this.$axios.post(
    '/api/submissions/create-from-images',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    }
  );

  return response.data;
}
```

## Need Help?

- Check `IMPLEMENTATION_SUMMARY.md` for detailed technical documentation
- Review server logs for error details
- Verify all dependencies are installed (see requirements.txt)
- Ensure Redis and Celery worker are running
