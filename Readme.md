# EvliyaMap Project - Setup and Deployment Guide

This guide is designed to help you create, build, and deploy a React project on Ubuntu systems using ngrok.

## 1. Preparation and Installation

Open Terminal: Navigate to the folder where you want to install the project (e.g., cd ~/Projects).

Create Project: Download the React template using Vite.

npm create vite@latest EvliyaMap -- --template react

Enter Folder:

cd EvliyaMap

Install Packages: Download standard packages.

npm install

Install Additional Library: Add the icon set used in your project.

npm install lucide-react

## 2. Running in Development Mode

To see instant changes while writing code.

Start Server:

npm run dev

(Check at http://localhost:5173 in your browser. Press Ctrl+C to stop.)

## 3. Building for Production

To prepare the site for release in compressed form.

Build Project:

npm run build

This command creates a folder named "dist" in the main directory. It contains the optimized version of the site.

Preview Build:
Test if the dist folder works properly.

npm run preview

(Usually opens on port http://localhost:4173.)

## 4. Publishing to the World with Ngrok

Option A: Share Development Mode (Live Editing)

If you want someone to watch you code in real-time:

In one terminal: npm run dev

In a second terminal:

ngrok http 5173

Option B: Share Compiled Version (Faster)

If you want to serve the finished, fast version of your site:

In one terminal: npm run preview

In a second terminal (pay attention to port number, preview is usually 4173):

ngrok http 4173

Note: When someone opens the Ngrok link and clicks the "Visit Site" button, they will see your site.
