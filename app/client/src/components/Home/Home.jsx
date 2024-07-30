import React from 'react'
import { Skeleton, theme, Layout } from 'antd';
const { Content } = Layout;
import FlightList from '../FlightsList/FlightsList'
import SearchForm from '../SearchForm/SearchForm';

function Home({ isFlightLoading, flightData }) {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
    return (
        <Content
            style={{
                margin: '24px 16px',
                padding: 24,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
            }}
        >

            <SearchForm flightData={flightData} />
            {
                isFlightLoading ? (
                    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <Skeleton active style={{ marginBottom: "20px" }} />
                        <Skeleton active style={{ marginBottom: "20px" }} />
                        <Skeleton active style={{ marginBottom: "20px" }} />
                    </div>
                ) : <FlightList flightData={flightData} />
            }

        </Content>
    )
}

export default Home