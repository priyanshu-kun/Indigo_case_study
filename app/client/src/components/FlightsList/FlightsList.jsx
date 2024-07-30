import React from 'react';
import { Space, Table, Tag } from 'antd';
const FlightList = ({ flightData }) => {


    const columns = [
        {
            title: 'Flight Id',
            dataIndex: 'flight_id',
            key: '1',
        },
        {
            title: 'Airline',
            dataIndex: 'airline',
            key: '2',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: '3',
        },
        {
            title: 'Departure Gate',
            dataIndex: 'departure_gate',
            key: '4',
        },
        {
            title: 'Arrival Gate',
            dataIndex: 'arrival_gate',
            key: '5',
        },

        {
            title: 'Schedule Arrival',
            dataIndex: 'scheduled_arrival',
            key: '6',
        },
        {
            title: 'Schedule Departure',
            dataIndex: 'scheduled_departure',
            key: '7',
        },

    ];
    const data = flightData?.message?.map((msg, idx) => {
        return (
            {
                key: idx+1,
                ...msg
            }
        )
    })

    // [
    //     {
    //         key: '2',
    //         name: 'Jim Green',
    //         age: 42,
    //         address: 'London No. 1 Lake Park',
    //         tags: ['loser'],
    //     },
    //     {
    //         key: '3',
    //         name: 'Joe Black',
    //         age: 32,
    //         address: 'Sydney No. 1 Lake Park',
    //         tags: ['cool', 'teacher'],
    //     },
    // ];


    return (
        <Table columns={columns} dataSource={data} />
    )
}
export default FlightList;