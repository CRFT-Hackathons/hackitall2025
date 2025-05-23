# InAble: Accessible Interview Platform

InAble is an innovative interview platform designed to provide an accessible and inclusive interview experience for all candidates, with specific features to support users with disabilities. The platform offers a comprehensive suite of tools for conducting remote interviews with enhanced accessibility options.

## Features

### Core Functionality
- **Structured Interview Experience**: Guided interview sessions with predefined questions
- **Video Recording**: Record video responses to interview questions
- **Video Transcription**: Automatically transcribe video responses for text-based review
- **Interactive Chat**: Real-time chat interface for interviewer-candidate communication
- **Whiteboard Tool**: Visual collaboration space for problem-solving exercises

### Accessibility Features
- **Multi-language Support**: Interview content available in English, Romanian, Italian, and Spanish (with many more to be added!)
- **Text-to-Speech**: Questions can be read aloud in multiple languages
- **Speech-to-Text**: Voice input for answering questions
- **Keyword Highlighting**: Visual emphasis on important terms in questions
- **Customizable Interface**: Adjustable font sizes, contrast modes, and other visual preferences
- **Break Options**: Scheduled breaks during interviews to reduce fatigue

### Cross Platform (Web, Desktop, Mobile):
![image](https://github.com/user-attachments/assets/bc6ac65d-c0df-40c9-84a6-adb4a52ef465)


## Technologies Used

### Frontend
- Next.js 15 with React 19
- TypeScript
- Tailwind CSS for styling
- Shadcn UI component library
- Framer Motion for animations
- Lucide React for icons

### Backend
- Next.js Server Components and API Routes
- Google Cloud Speech-to-Text API for transcription
- Google Cloud Text-to-Speech API for audio synthesis
- Google Gemini AI for text formalization
- FFmpeg for video processing

### Multimedia Processing
- WebRTC for video recording
- MediaRecorder API for audio capture
- FFmpeg for video-to-audio conversion

## Getting Started

### Prerequisites
- Node.js 18+
- PNPM package manager
- Google Cloud Platform account with Speech-to-Text, Text-to-Speech, and Gemini AI APIs enabled

### Environment Setup
1. Clone the repository
2. Copy the contents from `.env.example` to a new file named `.env.local`
3. Configure the following environment variables:
   - `GOOGLE_PROJECT_ID`: Your Google Cloud project ID
   - `GOOGLE_CLIENT_EMAIL`: Service account email
   - `GOOGLE_PRIVATE_KEY`: Service account private key
   - `GOOGLE_API_KEY`: API key for Gemini AI

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Production Deployment
```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Accessibility Compliance

InAble is designed with accessibility as a core principle, adhering to WCAG 2.1 AA standards. Key accessibility features include:
- Keyboard navigation support
- Screen reader compatibility
- High contrast modes
- Adjustable text sizes
- Focus indicators
- Alternative text for visual elements

## Privacy & Data Protection

InAble complies with GDPR regulations regarding user data:
- Secure storage and processing of interview recordings
- Local saving of accessibility preferences
- User rights to access, modify, or delete personal data
- Collection of only necessary information for accessible interview experiences

## License

[Proprietary License](LICENSE)

Copyright (c) 2025 CRFT

All rights reserved.

This code is the proprietary and confidential information of CRFT
and may not be used, disclosed, reproduced, or distributed without express
written permission from every member of the team CRFT (Dincă Robert, Huzum Petrișor, Ștefan Gătej).

THIS CODE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE CODE OR THE USE OR OTHER DEALINGS IN THE
CODE.
