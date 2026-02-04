import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#4A90E2",
                secondary: "#F5A623",
                background: "#FDFDFD",
                text: {
                    primary: "#333333",
                    secondary: "#666666",
                },
            },
            fontFamily: {
                heading: ["Poppins", "sans-serif"],
                body: ["Lato", "Roboto", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
