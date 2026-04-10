import { ThemeProvider } from './components/core';
import { AppRouter } from './router';

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;
