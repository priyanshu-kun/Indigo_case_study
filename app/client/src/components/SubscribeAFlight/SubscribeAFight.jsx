import React, { useState } from 'react';
import { Button, Checkbox, Form, Input, Slider } from 'antd';


const SubscribeAFlight = () => {

    const [] = useState({})

    const onFinish = (values) => {
        console.log('Success:', values);
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };


    return (
        <Form
            name="basic"
            labelCol={{
                span: 8,
            }}
            wrapperCol={{
                span: 16,
            }}
            style={{
                maxWidth: 600,
                margin: "30px auto"
            }}
            initialValues={{
                remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Form.Item
                label="Flight Id"
                name="flight_id"
                rules={[
                    {
                        required: true,
                        message: 'Please input your Flight Id',
                    },
                ]}
            >
                <Input onChange={handleInputChange} />
            </Form.Item>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    {
                        required: true,
                        message: 'Please input your Email to get notifications!',
                    },
                ]}
            >
                <Input onChange={handleInputChange} />
            </Form.Item>

            <Form.Item
                name="isenable"
                valuePropName="checked"
                wrapperCol={{
                    offset: 8,
                    span: 16,
                }}
            >
                <Checkbox>Enable Notifications</Checkbox>
            </Form.Item>


            <div >
            <span>Please use slider to set the rate of change in status updation per/sec</span>
            <Slider defaultValue={30} min={5} max={600} disabled={false} />
            </div>

            <Form.Item
                wrapperCol={{
                    offset: 8,
                    span: 16,
                }}
            >
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    )
};
export default SubscribeAFlight;