import React from 'react';
import { Button, Checkbox, Form, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

function SearchForm({ flightData }) {

    const onFinish = (values) => {
        console.log('Success:', values);
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const flight_options = flightData?.message?.map((msg, idx) => (
        {value: msg?.flight_id, label: msg?.flight_id}
    ))



    return (
        <>
            <Form
                name="basic"
                labelCol={{
                    span: 8,
                }}
                wrapperCol={{
                    span: 16,
                }}
                style={{
                    maxWidth: "fit-content",
                    display: "flex",
                    margin: "3rem auto",
                }}
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Select
                    showSearch
                    style={{
                        marginRight: "10px"
                    }}
                    placeholder="Enter Flight Id"
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={flight_options ? [...flight_options] : []}
                />
                <Select
                    showSearch
                    placeholder="Enter Flight Name"
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={[
                        {
                            value: 'Indigo',
                            label: 'Indigo',
                        },
                      
                    ]}
                />
          <Button type="primary" disabled icon={<SearchOutlined />} style={{marginLeft: "20px"}} >
            Search
          </Button>
            </Form>
        </>
    )
}

export default SearchForm