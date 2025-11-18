import AppRoutes from "./routes";
import { ThemeProvider } from "./context/theme-provider";
// Import APIs to ensure they're registered with RTK Query
import "./features/chatbot/chatbotAPI";
import "./features/complaint/complaintAPI";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;