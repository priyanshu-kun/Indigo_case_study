import React, { useState } from 'react';
import { Button, Checkbox, Form, Input, Select, Slider } from 'antd';
import useSubscribeFlight from '../../hook/useSubscibe';


const SubscribeAFlight = ({ isFlightLoading, flightData }) => {

    const [flight_id, setFlight_id] = useState("")
    const [email, setEmail] = useState("")
    const [allowUpdation, setAllowUpdation] = useState(true)
    const [seconds, setSeconds] = useState(5)

    const { subscribe, data, loading } = useSubscribeFlight({ flight_id, email, allowUpdation, seconds })

    const onFinish = (values) => {
        const newPaylod = {
            ...values,
            seconds,
        }
        subscribe(newPaylod)
           setFlight_id("")
           setEmail("")
           alert("Please check your mail for realtime status.")
    };

    const flight_options = flightData?.message?.map((msg, idx) => (
        { value: msg?.flight_id, label: msg?.flight_id }
    ))

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
            autoComplete="off"
        >

            <Form.Item
                label="Flight Id"
                name="flight_id"
                rules={[
                    {
                        required: true,
                        message: 'Please input your flight id',
                    },
                ]}
            >

            <Select
                showSearch
                style={{
                }}
                onChange={(e) => setFlight_id(e)}
                placeholder="Select Flight Id"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={flight_options ? [...flight_options] : []}
                value={flight_id}
            />


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
                <Input onChange={(e) => setEmail(e.target.value)} value={email} />
            </Form.Item>

            <Form.Item
                name="isenable"
                valuePropName="checked"
                wrapperCol={{
                    offset: 8,
                    span: 16,
                }}
            >
                <Checkbox value={allowUpdation} onChange={(e) => setAllowUpdation(!e.target.checked)}>Disable Notifications</Checkbox>
            </Form.Item>


            <div >
                <span>Please use slider to set the rate of change in status updation per/sec</span>
                <Slider onChange={(e) => setSeconds(e)} defaultValue={30} min={5} max={600} disabled={false} />
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