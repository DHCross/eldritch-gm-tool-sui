# Eldritch RPG GM Tools Suite

A comprehensive collection of Game Master tools for the Eldritch RPG system, including encounter generators, character creators, NPC generators, and battle calculators.

## 🎲 Features

- **GM Tool Suite**: All-in-one toolkit with tabbed interface
- **Advanced Encounter Generator**: Create balanced encounters with detailed threat calculations
- **Character Generator**: Generate complete player characters for Eldritch RPG 2nd Edition
- **NPC Generator**: Create detailed non-player characters with stats and equipment
- **Monster Generator**: Generate creatures for encounters
- **Battle Phase Calculator**: Track initiative and manage combat rounds
- **Monster HP Calculator**: Calculate hit points with size and nature modifiers

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- A modern web browser

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DHCross/Eldritch-GM-Tools.git
   cd Eldritch-GM-Tools
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   This will start a local HTTP server on `http://localhost:3000` and automatically open the tools in your browser.

### Alternative Setup (No Node.js)

If you don't have Node.js installed, you can still use the tools:

1. Download or clone the repository
2. Open `index.html` in your web browser
3. Navigate to the different tools from the main page

## 📁 Project Structure

```
Eldritch-GM-Tools/
├── index.html                     # Main landing page
├── gm_tools.html                 # Unified GM tools interface
├── src/                          # Source files
│   ├── css/                      # Stylesheets
│   │   ├── main.css             # Main styles
│   │   └── gm-tools.css         # GM tools specific styles
│   └── js/                       # JavaScript modules
│       ├── main.js              # Main utilities
│       └── gm-tools.js          # GM tools functionality
├── tools/                        # Individual tool HTML files
├── assets/                       # Static assets
├── package.json                  # Node.js dependencies and scripts
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 🛠️ Development

### Available Scripts

- `npm start` or `npm run dev` - Start development server with auto-open
- `npm run serve` - Start server without auto-opening browser
- `npm run build` - No build process needed (static files)

### Making Changes

1. **CSS Changes**: Edit files in `src/css/`
2. **JavaScript Changes**: Edit files in `src/js/`
3. **HTML Changes**: Edit the individual HTML files
4. **New Features**: Add new modules to the appropriate directories

### Adding New Tools

1. Create a new HTML file for the tool
2. Add corresponding CSS in `src/css/`
3. Add JavaScript functionality in `src/js/`
4. Update the main `index.html` to link to your new tool
5. Update this README

## 🎮 Using the Tools

### GM Tool Suite (`gm_tools.html`)
The unified interface provides access to all tools in a tabbed format:
- Encounter Generator
- NPC Generator  
- Character Generator
- Battle Calculator
- Monster HP Calculator

### Individual Tools
Each tool can also be accessed directly via its HTML file for specialized use.

## 🔧 Configuration

The tools use local storage to save preferences where applicable. No external configuration is required.

## 📊 Data Files

- `Eldritch Rules 8.17.2025.txt` - Game rules reference
- `grimoire_index sheets - Grimoire.csv` - Spell and magic reference data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Style Guidelines

- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Comment complex logic
- Test changes across different browsers

## 🐛 Troubleshooting

### Common Issues

**Tools not loading properly:**
- Ensure you're serving the files through HTTP (not file://)
- Check browser console for JavaScript errors
- Verify all CSS and JS files are loading correctly

**Styles not applying:**
- Check that CSS files are properly linked
- Verify file paths are correct
- Clear browser cache and reload

**JavaScript errors:**
- Check browser console for specific error messages
- Ensure all required files are present
- Verify JavaScript modules are properly linked

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

- [ ] Add more creature types and templates
- [ ] Implement save/load functionality for generated content
- [ ] Add export options (PDF, JSON)
- [ ] Create mobile-responsive designs
- [ ] Add more customization options
- [ ] Integrate with virtual tabletop platforms

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing [GitHub Issues](https://github.com/DHCross/Eldritch-GM-Tools/issues)
3. Create a new issue if your problem isn't covered

## 🏷️ Version History

### v1.0.0 (Current)
- Initial release with core GM tools
- Modular architecture with separated CSS/JS
- Local development setup
- Comprehensive documentation

---

Built for Game Masters running Eldritch RPG campaigns. Happy gaming! 🎲
