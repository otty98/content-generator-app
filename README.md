# AI Marketing Copy Generator

Welcome to the AI Marketing Copy Generator! This is a React application built with Vite that leverages the Google Gemini Pro model to help you quickly generate various types of marketing content.

## 🎥 Project Demonstration

Since GitHub Pages deployment is experiencing some issues (specifically with API key handling and asset paths on a subpath deployment), here's a short video demonstration of the application in action. This shows the core functionality of generating marketing copy.

**Watch the Demo Video Here!**>> https://youtu.be/u8QdjyzGh68

---

## 🚀 Getting Started (Run Locally)

Follow these steps to get a copy of the project up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js:** (LTS version recommended) You can download it from [nodejs.org](https://nodejs.org/).
* **npm** (Node Package Manager): Comes bundled with Node.js.
* **Google Gemini API Key:** You'll need to obtain an API key from the Google AI Studio or Google Cloud Console. Instructions on getting started with the Gemini API can usually be found in the official Google AI documentation.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/otty98/content-generator-app.git](https://github.com/otty98/content-generator-app.git)
    ```
2.  **Navigate into the project directory:**
    ```bash
    cd content-generator-app
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

### Configuration (API Key)

This project uses environment variables to manage the API key. **For security reasons, your API key should NEVER be committed to version control (like Git).**

1.  **Create a `.env` file:** In the root of your project directory (the same level as `package.json`), create a new file named `.env`.
2.  **Add your API Key:** Open the `.env` file and add your Gemini API key in the following format:
    ```

    **Important:** This `.env` file is typically ignored by Git (check your `.gitignore` to ensure `.env` is listed). Even with this, for truly production-ready applications, it's recommended to proxy API calls through a secure backend or serverless function to fully hide the API key from client-side bundles. This project currently makes direct client-side calls for simplicity in local development.

### Running the Project

Once the dependencies are installed and your API key is configured, you can run the development server:

```bash
npm run dev