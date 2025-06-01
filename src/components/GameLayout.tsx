import { Layout, Switch, Typography } from 'antd';
import React from 'react';

const { Header, Content, Footer } = Layout;
const { Title: AntTitle } = Typography;

interface GameLayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  onThemeChange: (checked: boolean) => void;
}
export const GameLayout: React.FC<GameLayoutProps> = ({ children, isDarkMode, onThemeChange }) => (
  <Layout style={{ minHeight: '100vh' }}> {/* This ensures the layout itself tries to fill the viewport height */}
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10, width: '100%' }}> {/* Make Header sticky */}
      <AntTitle level={3} style={{ color: 'white', margin: 0, lineHeight: '64px' }}>
        Hoops
      </AntTitle>
      <Switch
        checked={isDarkMode}
        onChange={onThemeChange}
        checkedChildren="Dark"
        unCheckedChildren="Light"
      />
    </Header>
    {/* Content now needs to handle the sticky header's height if necessary, but AntD Layout usually does this well.
        If content is still hidden, an explicit top padding/margin on Content or its first child might be needed.
        However, Layout.Content is designed to flow after Layout.Header.
    */}
    <Content style={{ padding: '24px', marginTop: 0 }}> {/* Resetting marginTop, sticky header should manage space */}
      <div style={{ padding: '24px 0', borderRadius: 8, maxWidth: 960, margin: '0 auto' }}> {/* Adjusted padding for content wrapper */}
        {children}
      </div>
    </Content>
    <Footer style={{ textAlign: 'center' }}>
      Hoops v0.4.2.LayoutFix - Concept by User ©{new Date().getFullYear()}
    </Footer>
  </Layout>
);