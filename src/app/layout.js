export const metadata = {
  title: 'Unify Idea Generator',
  description: 'Generate AI agent and snippet ideas for outbound',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
