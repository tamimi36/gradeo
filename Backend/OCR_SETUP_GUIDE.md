# Google Cloud Vision OCR Setup Guide

Complete guide for setting up and using the Google Cloud Vision OCR system in the Gradeo exam scanner backend.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Google Cloud Vision API Setup](#google-cloud-vision-api-setup)
3. [Redis Installation](#redis-installation)
4. [Backend Setup](#backend-setup)
5. [Running the System](#running-the-system)
6. [Testing OCR](#testing-ocr)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Python 3.9 or higher
- Google Cloud account (Free tier available with $300 credits)
- Redis server
- Windows/Mac/Linux operating system

---

## Google Cloud Vision API Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `gradeo-ocr` (or your preferred name)
4. Click "Create"
5. Note your **Project ID** (you'll need this)

### Step 2: Enable Cloud Vision API

1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Cloud Vision API"
3. Click on "Cloud Vision API"
4. Click "**Enable**"
5. Wait for the API to be enabled (~1 minute)

### Step 3: Get API Key

You have two options:

#### Option A: API Key (Simpler - Already Done!)
- ✅ You've already provided the API key: `AIzaSyC3vPWWQcnupFntxE704DaqYp8yMDOtQbE`
- This key is already configured in your `.env` file
- **Skip to Step 4**

#### Option B: Service Account (More Secure - Optional)
If you want to switch to service account authentication later:
1. Go to **IAM & Admin** → **Service Accounts**
2. Click "**Create Service Account**"
3. Name: `gradeo-ocr-service`
4. Click "Create and Continue"
5. Grant role: **Cloud Vision API User**
6. Click "Continue" → "Done"
7. Click on the created service account
8. Go to "**Keys**" tab
9. Click "Add Key" → "Create new key"
10. Choose **JSON** format
11. Download the key file (e.g., `google-vision-key.json`)
12. Save it in your backend directory
13. Update `.env`:
    ```bash
    GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\google-vision-key.json
    ```

### Step 4: Set Up Billing (Required)

1. Go to **Billing** in Google Cloud Console
2. Link a billing account or create new one
3. **Free Tier Benefits:**
   - $300 free credits for new users
   - First 1,000 Vision API requests/month are FREE
   - After that: $1.50 per 1,000 requests

### Step 5: Configure Quotas (Optional)

1. Go to **APIs & Services** → **Quotas**
2. Search for "Cloud Vision API"
3. Default quotas:
   - 1,800 requests per minute
   - 60,000 requests per day
4. Adjust if needed for your usage

---

## Redis Installation

Redis is required for Celery (asynchronous task queue).

### Windows

#### Option 1: Using Chocolatey (Recommended)
```bash
# Install Chocolatey first (if not installed)
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Redis
choco install redis-64 -y

# Start Redis
redis-server
```

#### Option 2: Manual Installation
1. Download Redis from [GitHub Releases](https://github.com/microsoftarchive/redis/releases)
2. Extract and run `redis-server.exe`

### Mac

```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install redis-server -y
sudo systemctl start redis
sudo systemctl enable redis
```

### Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

---

## Backend Setup

### Step 1: Install Python Dependencies

```bash
cd C:\Users\htami\onedrive\desktop\gradeo\gradeo\backend
pip install -r requirements.txt
```

### Step 2: Verify Configuration

Check that your `.env` file contains:

```bash
# Google Cloud Vision OCR Configuration
GOOGLE_VISION_API_KEY=AIzaSyC3vPWWQcnupFntxE704DaqYp8yMDOtQbE
GOOGLE_VISION_API_QUOTA_PER_MINUTE=60

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# OCR Processing Configuration
OCR_CONFIDENCE_THRESHOLD=0.7
OCR_MAX_RETRIES=3
OCR_RETRY_DELAY_SECONDS=60
```

### Step 3: Run Database Migrations

```bash
# Initialize migrations (if not already done)
flask db init

# Create migration for OCR models
flask db migrate -m "Add OCR support with Google Vision"

# Apply migrations
flask db upgrade
```

---

## Running the System

You need to run **THREE** processes simultaneously:

### Terminal 1: Flask Backend

```bash
cd C:\Users\htami\onedrive\desktop\gradeo\gradeo\backend
python run.py
```

Server will start at: `http://localhost:5001`

### Terminal 2: Celery Worker

```bash
cd C:\Users\htami\onedrive\desktop\gradeo\gradeo\backend
celery -A celery_worker.celery worker --loglevel=info --pool=solo -Q ocr_queue,default
```

**Important:** Use `--pool=solo` on Windows!

### Terminal 3: Redis Server (if not running as service)

```bash
redis-server
```

---

## Testing OCR

### Step 1: Create an Exam

1. Open Swagger UI: `http://localhost:5001/api/v1/swagger/`
2. Login as a teacher
3. Create an exam:
   ```json
   POST /api/v1/exams
   {
     "title": "Math Exam Test",
     "description": "Test OCR with math problems",
     "subject_type": "mathematics",
     "primary_language": "en",
     "has_formulas": true,
     "total_points": 100
   }
   ```

### Step 2: Add Questions

```json
POST /api/v1/exams/{exam_id}/questions
{
  "question_text": "What is 2 + 2?",
  "question_type": "open_ended",
  "points": 10,
  "order_number": 1
}
```

### Step 3: Upload a Scanned Exam Paper

1. Prepare a test image (handwritten answers)
2. Upload:
   ```bash
   POST /api/v1/submissions
   - exam_id: {your_exam_id}
   - student_id: {your_student_id}
   - file: [upload image]
   ```

3. Response will include `task_id`

### Step 4: Check OCR Status

```bash
GET /api/v1/submissions/{submission_id}/ocr-status
```

Response:
```json
{
  "status": "success",
  "job": {
    "id": 1,
    "job_status": "completed",
    "retry_count": 0,
    "started_at": "2025-12-09T10:00:00",
    "completed_at": "2025-12-09T10:00:15"
  }
}
```

### Step 5: View OCR Results

```bash
GET /api/v1/submissions/{submission_id}/ocr-results
```

Response:
```json
{
  "status": "success",
  "ocr_results": [
    {
      "id": 1,
      "ocr_service": "google_vision",
      "raw_text": "4",
      "processed_text": "4",
      "confidence_score": 0.95,
      "detected_language": "en"
    }
  ]
}
```

### Step 6: View Extracted Answers

```bash
GET /api/v1/submissions/{submission_id}
```

Check the `answers` array in the response.

---

## OCR Strategy Configuration

### Automatic Strategy Selection

The system automatically selects the best OCR strategy based on:

1. **Exam Subject Type:**
   - `mathematics` → Uses DOCUMENT_TEXT_DETECTION + formula handling
   - `arabic` → Uses Arabic language hints
   - `science` → Mixed content handling

2. **Primary Language:**
   - `ar` → Arabic language hints
   - `en` → English language hints
   - `mixed` → Both languages

3. **Content Type:**
   - `has_formulas: true` → Special formula processing
   - `has_diagrams: true` → Preserves diagram locations

### Manual Strategy Configuration (Admin)

Admins can create custom OCR strategies:

```json
POST /api/v1/ocr/strategies
{
  "strategy_name": "arabic_handwriting",
  "ocr_method": "document_text_detection",
  "language_hints": ["ar"],
  "description": "Optimized for Arabic handwritten exams",
  "is_active": true
}
```

---

## Monitoring OCR Jobs

### Admin Dashboard

Access OCR statistics:
```bash
GET /api/v1/ocr/stats
```

Response:
```json
{
  "status": "success",
  "stats": {
    "total_jobs": 150,
    "completed": 142,
    "failed": 3,
    "queued": 2,
    "processing": 3,
    "success_rate": 94.67
  }
}
```

### View All Jobs

```bash
GET /api/v1/ocr/jobs
```

Lists last 100 OCR jobs with their status.

---

## Troubleshooting

### Issue: "Google Vision API key is required"

**Solution:**
- Check `.env` file has `GOOGLE_VISION_API_KEY`
- Restart Flask server after updating `.env`
- Verify API key is correct

### Issue: Celery worker not starting

**Solution:**
```bash
# On Windows, always use --pool=solo
celery -A celery_worker.celery worker --loglevel=info --pool=solo -Q ocr_queue,default

# Check Redis is running
redis-cli ping
```

### Issue: "Redis connection refused"

**Solution:**
- Start Redis server: `redis-server`
- Check Redis is running: `redis-cli ping`
- Verify `CELERY_BROKER_URL` in `.env`

### Issue: OCR job stuck in "queued" status

**Solution:**
- Check Celery worker is running
- Check worker logs for errors
- Verify image file exists
- Check Google Vision API quota (may be exceeded)

### Issue: Low OCR confidence scores

**Solution:**
- Ensure scanned images are high quality (300+ DPI)
- Check image is not blurry or skewed
- Verify correct language is set on exam
- Try different OCR strategy

### Issue: "Vision API error: quota exceeded"

**Solution:**
- Check Google Cloud Console → Quotas
- Default is 1,800 requests/minute
- Wait a minute and retry
- Request quota increase if needed

### Issue: Arabic text not recognized correctly

**Solution:**
- Set exam `primary_language` to `ar` or `mixed`
- Ensure high-quality scan
- Arabic handwriting may have lower accuracy (typical for OCR)

---

## Performance Tips

1. **Image Quality:**
   - Use 300 DPI or higher for scanning
   - Ensure good lighting and contrast
   - Avoid shadows and glare

2. **Batch Processing:**
   - Celery automatically queues multiple submissions
   - Rate limit: 10 OCR tasks/minute (configurable)

3. **Cost Optimization:**
   - First 1,000 requests/month are FREE
   - Cache OCR results (don't reprocess same image)
   - Use appropriate OCR strategy (TEXT_DETECTION is faster/cheaper than DOCUMENT_TEXT_DETECTION)

4. **Monitoring:**
   - Use `/api/v1/ocr/stats` to monitor success rates
   - Check Celery worker logs for errors
   - Monitor Google Cloud billing

---

## API Endpoints Summary

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/v1/submissions` | POST | Upload exam paper (triggers OCR) | Student/Teacher |
| `/api/v1/submissions/{id}/ocr-status` | GET | Check OCR processing status | Student/Teacher |
| `/api/v1/submissions/{id}/ocr-results` | GET | View OCR results | Student/Teacher |
| `/api/v1/submissions/{id}/reprocess` | POST | Retry OCR processing | Teacher/Admin |
| `/api/v1/ocr/strategies` | GET/POST | Manage OCR strategies | Admin |
| `/api/v1/ocr/jobs` | GET | View OCR job queue | Admin |
| `/api/v1/ocr/stats` | GET | OCR statistics | Admin |

---

## Support & Contact

- **Documentation:** See other guides in `/docs` folder
- **Issues:** Report bugs on GitHub
- **Google Cloud Support:** https://cloud.google.com/support

---

## Next Steps

After OCR is working:
1. Implement auto-grading logic (handled by grading agents)
2. Set up review queue for low-confidence answers
3. Configure email notifications for completed processing
4. Deploy to production environment

**Congratulations!** Your OCR system is now fully configured and ready to scan exams! 🎉
