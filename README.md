# GLM Chatbot - Generative UI Edition

A powerful chatbot powered by GLM-5.1 with dynamic UI generation using OpenUI.

## ✨ Features

### 🤖 AI-Powered Chat
- Real-time streaming responses from GLM-5.1
- Message history maintained throughout session
- Beautiful gradient UI with responsive design

### 🎨 Generative UI (NEW!)
The chatbot can now **generate and display interactive UI components** dynamically:

**Supported Components:**
- 📊 **Charts** - Data visualizations with interactive graphs
- 📋 **Cards** - Rich information cards with styled content
- 📑 **Tables** - Sortable, filterable data tables
- 📝 **Forms** - Interactive input forms for structured data
- 🔘 **Buttons** - Action buttons with click handlers
- 📁 **Lists** - Structured lists and item collections
- 🎯 **Progress Bars** - Visual progress indicators
- 📎 **Badges** - Status and category badges

### How Generative UI Works

1. **System Prompt**: The AI is instructed to use OpenUI Lang syntax
2. **UI Generation**: GLM-5.1 generates compact OpenUI Lang markup instead of plain text
3. **Streaming Rendering**: Components render progressively as tokens arrive
4. **Interactive**: Users can click buttons, submit forms, interact with generated UI

### Example Prompts

Try asking the AI to generate UI:

```
"Show me a weather card for Bangalore"
"Create a todo list with 3 items"
"Display a bar chart of my sales data"
"Build a contact form"
"Show a table of users with status badges"
```

## 🚀 Live Demo

**https://glm-test-two.vercel.app**

## 🛠️ Tech Stack

- **LLM**: GLM-5.1 (Z.AI Coding Plan)
- **Generative UI**: OpenUI Lang
- **Frontend**: React 19 + Vite
- **Components**: @openuidev/react-ui (35+ components)
- **Runtime**: @openuidev/react-lang (streaming parser)
- **Styling**: CSS-in-JS with gradient theme

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/notjitin-1994/glm-test.git
cd glm-test

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

Edit `src/App.jsx` to customize:

```javascript
const API_KEY = 'your-api-key-here';
const MODEL = 'glm-5.1';  // or glm-5-turbo, glm-4.7, glm-4.5-air
```

## 🎯 OpenUI Lang Syntax

The AI generates UI using a compact line-oriented language:

```openui
# Create a card
card = Card({
  title: "Weather",
  body: Stack([
    Text("☀️ Sunny, 28°C"),
    Text("Bangalore, India")
  ])
})

# Create a table
table = Table({
  columns: ["Name", "Role"],
  rows: [
    ["Alice", "Admin"],
    ["Bob", "User"]
  ]
})

# Create a chart
chart = BarChart({
  data: [{ label: "Q1", value: 100 }, { label: "Q2", value: 150 }]
})
```

## 📚 Resources

- [OpenUI Documentation](https://www.openui.com/docs)
- [OpenUI Playground](https://www.openui.com/playground)
- [Z.AI API Docs](https://docs.z.ai/api-reference/introduction)
- [GLM Models](https://docs.z.ai/guides/llm/glm-5)

## 🤝 Contributing

Contributions welcome! Feel free to open issues or submit PRs.

## 📄 License

MIT License - feel free to use in your projects!

---

**Built with ❤️ using GLM-5.1 + OpenUI**
