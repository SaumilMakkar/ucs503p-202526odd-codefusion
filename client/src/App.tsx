import AppRoutes from "./routes";
import { ThemeProvider } from "./context/theme-provider";
// Import chatbot API to ensure it's registered with RTK Query
import "./features/chatbot/chatbotAPI";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;