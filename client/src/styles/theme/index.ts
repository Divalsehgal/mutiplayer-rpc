import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
    theme: {
        tokens: {
            colors: {
                brand: {
                    50: { value: "#e3f2fd" },
                    100: { value: "#bbdefb" },
                    200: { value: "#90caf9" },
                    300: { value: "#64b5f6" },
                    400: { value: "#42a5f5" },
                    500: { value: "#2196f3" },
                    600: { value: "#1e88e5" },
                    700: { value: "#1976d2" },
                    800: { value: "#1565c0" },
                    900: { value: "#0d47a1" },
                },
            },

            fonts: {
                body: { value: "Inter, sans-serif" },
                heading: { value: "Inter, sans-serif" },
                mono: { value: "'Fira Code', monospace" },
            },
        },

        semanticTokens: {
            colors: {
                "bg.canvas": { value: { base: "white", _dark: "gray.950" } },
                "bg.surface": { value: { base: "gray.50", _dark: "gray.900" } },
                "border.default": { value: { base: "gray.200", _dark: "gray.700" } },
            },
        },
    },

    globalCss: {
        body: {
            bg: "bg.canvas",
            color: "fg.default",
            fontFamily: "body",
        },
    },
});
