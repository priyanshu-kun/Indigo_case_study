import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, Skeleton, Spin, theme } from 'antd';
import { AntDesignOutlined, HomeOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
const { Header, Sider, Content } = Layout;
import "./App.css"
import SearchForm from './components/SearchForm/SearchForm';
import FlightList from './components/FlightsList/FlightsList';
import useGetAllFlights from './hook/useFetchFlights'
import Home from './components/Home/Home';
import SubscribeAFlight from './components/SubscribeAFlight/SubscribeAFight';





const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { isFlightLoading, flightData } = useGetAllFlights();

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <Home isFlightLoading={isFlightLoading} flightData={flightData} />;
      case '2':
        return <SubscribeAFlight isFlightLoading={isFlightLoading} flightData={flightData} />;
      default:
        return <div>404</div>;
    }
  };


  return (
    <Layout style={{
      height: "100vh"
    }}>

      <Sider trigger={null} style={{ paddingTop: "30px" }} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          onClick={handleMenuClick}
          items={[
            {
              key: '1',
              icon: <HomeOutlined />,
              label: 'Home',
            },
            {
              key: '2',
              icon: <PlusOutlined />,
              label: 'Subscribe to Flight',
            },

          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        {renderContent()}
      </Layout>
    </Layout>
  );
};
export default App;