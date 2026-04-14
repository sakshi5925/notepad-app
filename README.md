# 📝 Notepad Pro

A modern, feature-rich note-taking application built with React, Vite, and Supabase. Experience seamless note management with advanced features like tagging, archiving, search, and real-time synchronization.

![Notepad Pro](https://img.shields.io/badge/React-18.2.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF) ![Supabase](https://img.shields.io/badge/Supabase-2.0.0-3ECF8E) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.0-38B2AC)

## ✨ Features

### 🎯 Core Features
- **📝 Create & Edit Notes** - Rich text notes with titles and content
- **🖼️ Image Upload** - Attach images to your notes
- **❤️ Favorites** - Mark important notes with heart icon
- **📋 Copy Content** - One-click copy to clipboard
- **🗑️ Delete Notes** - Permanent deletion with confirmation

### 🔍 Advanced Features
- **🔎 Real-time Search** - Search through titles and content instantly
- **🏷️ Tags System** - Organize notes with color-coded tags
- **📦 Archive System** - Soft delete with restore functionality
- **📱 Responsive Design** - Works perfectly on all devices
- **🌙 Dark Theme** - Beautiful dark UI with cyan accents

### 🔐 Security & Performance
- **🔐 User Authentication** - Secure login/signup with Supabase Auth
- **⚡ Real-time Sync** - Instant synchronization across devices
- **🚀 Fast Performance** - Optimized with Vite and React
- **📊 Database Optimization** - Indexed queries for speed

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide Icons** - Beautiful icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - User authentication and authorization
- **Supabase Storage** - File upload and management
- **Row Level Security** - Database-level security policies

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/notepad-pro.git
   cd notepad-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run these SQL queries in your Supabase SQL Editor:

   ```sql
   -- Add archived column to notes table
   ALTER TABLE notes ADD COLUMN archived BOOLEAN DEFAULT false;

   -- Create tags table
   CREATE TABLE IF NOT EXISTS tags (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     color TEXT DEFAULT 'cyan',
     created_at TIMESTAMP DEFAULT now(),
     UNIQUE(user_id, name)
   );

   -- Create junction table for note-tags relationship
   CREATE TABLE IF NOT EXISTS note_tags (
     note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
     tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
     PRIMARY KEY (note_id, tag_id)
   );

   -- Create indexes for better performance
   CREATE INDEX idx_tags_user_id ON tags(user_id);
   CREATE INDEX idx_note_tags_note_id ON note_tags(note_id);
   CREATE INDEX idx_note_tags_tag_id ON note_tags(tag_id);
   CREATE INDEX idx_notes_archived ON notes(user_id, archived);
   ```

5. **Row Level Security (Optional)**
   If using RLS, add these policies:

   ```sql
   -- For tags table
   CREATE POLICY "Users can view their own tags" ON tags
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can manage their own tags" ON tags
     FOR ALL USING (auth.uid() = user_id);

   -- For note_tags table
   CREATE POLICY "Users can manage note_tags" ON note_tags
     FOR ALL USING (
       EXISTS (SELECT 1 FROM notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid())
     );
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Usage

### Creating Your First Note
1. **Sign up/Login** - Create an account or log in
2. **Create Note** - Click "Create Note" section
3. **Add Content** - Enter title and content
4. **Add Tags** - Click "+ New Tag" to create and assign tags
5. **Upload Image** - Optional: attach an image
6. **Save** - Click "Add Note"

### Managing Notes
- **Search** - Use the search bar in the navbar
- **Filter** - Toggle between "Active Notes" and "Archived"
- **Favorite** - Click ❤️ to mark as favorite
- **Archive** - Click 📦 to archive (soft delete)
- **Edit** - Click ✏️ to edit a note
- **Copy** - Click 📋 to copy content
- **Delete** - Click 🗑️ to permanently delete

### Tags System
- **Create Tags** - Click "+ New Tag" while creating/editing notes
- **Choose Colors** - Select from 6 color options (cyan, emerald, violet, rose, amber, blue)
- **Assign Tags** - Click tag pills to select/deselect
- **View Tags** - Tags display on note cards with colors

## 📁 Project Structure

```
notepad-pro/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation with search
│   │   ├── NoteCard.jsx        # Individual note display
│   │   └── TagSelector.jsx     # Tag creation and selection
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main notes dashboard
│   │   └── Login.jsx           # Authentication page
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # App entry point
│   ├── index.css               # Global styles
│   └── supabaseClient.js       # Supabase configuration
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── README.md
```

## 🎨 UI/UX Design

### Color Scheme
- **Primary**: Cyan (#06B6D4)
- **Secondary**: Emerald (#10B981)
- **Background**: Dark slate gradient
- **Text**: White and slate variations
- **Accent**: Various tag colors

### Typography
- **Font Family**: System fonts (Inter, sans-serif)
- **Headings**: Bold, cyan accent
- **Body**: Clean, readable text

### Components
- **Cards**: Glassmorphism effect with hover animations
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Icons**: Lucide React icons

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables in Netlify dashboard

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow ESLint rules
- Use meaningful commit messages
- Test your changes thoroughly
- Update documentation if needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - For the amazing backend-as-a-service
- **Tailwind CSS** - For the utility-first CSS framework
- **Vite** - For the blazing fast build tool
- **React** - For the powerful frontend library
- **Lucide** - For the beautiful icons

## 📞 Support

If you have any questions or need help:

- **Issues**: [GitHub Issues](https://github.com/yourusername/notepad-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/notepad-pro/discussions)
- **Email**: your-email@example.com

---

**Made with ❤️ using React, Vite, and Supabase**

⭐ Star this repo if you found it helpful!
