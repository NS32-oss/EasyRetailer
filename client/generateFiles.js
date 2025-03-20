// generateFiles.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToCreate = [
  // Utility function file
  {
    filePath: "src/lib/utils.js",
    content: `export function cn(...args) {
  return args
    .map(arg => {
      if (!arg) return '';
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object') {
        return Object.entries(arg)
          .filter(([key, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}
`,
  },
  // Card Components
  {
    filePath: "src/components/ui/card.jsx",
    content: `import React from 'react';

export function Card({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function CardHeader({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h2 className={className}>{children}</h2>;
}

export function CardContent({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function CardDescription({ children, className }) {
  return <p className={className}>{children}</p>;
}
`,
  },
  // Toaster Component
  {
    filePath: "src/components/ui/toaster.jsx",
    content: `import React from 'react';

export function Toaster() {
  // Placeholder Toaster component
  return <div id="toaster" />;
}

export default Toaster;
`,
  },
  // Button Component
  {
    filePath: "src/components/ui/button.jsx",
    content: `import React from 'react';

export function Button({ children, onClick, className, ...props }) {
  return (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  );
}

export default Button;
`,
  },
  // Spinner Component
  {
    filePath: "src/components/ui/spinner.jsx",
    content: `import React from 'react';
import { cn } from '@/lib/utils';

export function Spinner({ size = 'md', className }) {
  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
        {
          'h-4 w-4': size === 'sm',
          'h-8 w-8': size === 'md',
          'h-12 w-12': size === 'lg',
        },
        className,
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
`,
  },
  // Theme Provider
  {
    filePath: "src/components/theme-provider.jsx",
    content: `import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children, defaultTheme = 'light', enableSystem = false }) {
  const [theme, setTheme] = useState(defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
`,
  },
  // Input Component
  {
    filePath: "src/components/ui/input.jsx",
    content: `import React from 'react';

export function Input({ className, ...props }) {
  return <input className={className} {...props} />;
}

export default Input;
`,
  },
  // Label Component
  {
    filePath: "src/components/ui/label.jsx",
    content: `import React from 'react';

export function Label({ children, className, ...props }) {
  return <label className={className} {...props}>{children}</label>;
}

export default Label;
`,
  },
  // Table Component
  {
    filePath: "src/components/ui/table.jsx",
    content: `import React from 'react';

export function Table({ children, className }) {
  return <table className={className}>{children}</table>;
}

export function TableHeader({ children, className }) {
  return <thead className={className}>{children}</thead>;
}

export function TableRow({ children, className }) {
  return <tr className={className}>{children}</tr>;
}

export function TableBody({ children, className }) {
  return <tbody className={className}>{children}</tbody>;
}
`,
  },
  // Tabs Component
  {
    filePath: "src/components/ui/tabs.jsx",
    content: `import React from 'react';

export function Tabs({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function TabsList({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ children, className, onClick }) {
  return <button className={className} onClick={onClick}>{children}</button>;
}

export function TabsContent({ children, className }) {
  return <div className={className}>{children}</div>;
}
`,
  },
  // Radio Group Component
  {
    filePath: "src/components/ui/radio-group.jsx",
    content: `import React from 'react';

export function RadioGroup({ children, className, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function RadioGroupItem({ className, ...props }) {
  return <input type="radio" className={className} {...props} />;
}
`,
  },
  // Separator Component
  {
    filePath: "src/components/ui/separator.jsx",
    content: `import React from 'react';

export function Separator({ className }) {
  return <hr className={className} />;
}

export default Separator;
`,
  },
  // Select Component
  {
    filePath: "src/components/ui/select.jsx",
    content: `import React from 'react';

export function Select({ children, className, ...props }) {
  return <select className={className} {...props}>{children}</select>;
}

export function SelectValue({ children, className, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export default Select;
`,
  },
  // Dialog Component
  {
    filePath: "src/components/ui/dialog.jsx",
    content: `import React from 'react';

export function Dialog({ children, className, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export default Dialog;
`,
  },
];

function createFile(filePath, content) {
  const fullPath = path.resolve(__dirname, filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, content, "utf8");
  console.log(`Created: ${filePath}`);
}

filesToCreate.forEach((file) => {
  createFile(file.filePath, file.content);
});
