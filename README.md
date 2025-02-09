# 🤖 VS Code Robot Keywords

**VS Code Robot Keywords** is an extension for **Visual Studio Code** that indexes and displays all the keywords from **Robot Framework** iles in the project. With it, you can quickly search and navigate through your keywords, improving organization and productivity when writing automated tests.

---

## 📥 Installation

### 🔹 1. Clone the Repository
If you don’t have the extension yet, clone the repository locally:

```sh
git clone todo
cd vscode-robot-keywords
```
🔹 2. Install Dependencies

Before running the extension, install the necessary dependencies:
```
npm install
```
🔹 3. Compile the TypeScript Code

Compile the project to generate the necessary files:
```
npm run build
```
🔹 4. Run in VS Code (Development Mode)

To test the extension locally in VS Code, run:
```
npm run compile
```
Now, press F5 to open a new VS Code window – Extension Development Host – and test the extension.

🚀 How to Use

📌 1. Open a project that contains .robot files

The extension will automatically activate when a workspace contains .robot files.

📌 2. Access the Sidebar

In the VS Code sidebar, click on the Robot Keywords extension icon.

📌 3. Search for Keywords
	•	Click the 🔍 Search Keywords button in the sidebar to search for specific keywords.
	•	Enter the name of the keyword you want to find.

📌 4. Clear Filter
	•	Click the 🗑️ Reset Filters button to display all keywords again.

📌 5. Open Keyword in Code
	•	Click on any listed keyword to open it directly in the editor at the line where it is defined.