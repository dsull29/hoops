// --- FILE: src/components/GameLayout.tsx ---
import { Layout, Typography } from "antd";
import React from "react";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

interface GameLayoutProps {
  children: React.ReactNode;
}
export const GameLayout: React.FC<GameLayoutProps> = ({ children }) => (
  <Layout style={{ minHeight: "100vh" }}>
    <Header
      style={{ display: "flex", alignItems: "center", padding: "0 24px" }}
    >
      <Title
        level={3}
        style={{ color: "white", margin: 0, lineHeight: "64px" }}
      >
        Roguelike Basketball Sim
      </Title>
    </Header>
    <Content style={{ padding: "24px", background: "#f0f2f5" }}>
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </Content>
    <Footer style={{ textAlign: "center", background: "#f0f2f5" }}>
      Roguelike Basketball Sim v0.2.Modular - Concept by User ©
      {new Date().getFullYear()}
    </Footer>
  </Layout>
);
