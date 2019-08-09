import { IOperationLog, Operation } from "@staticdeploy/core";
import Table, { ColumnProps } from "antd/es/table";
import Tag from "antd/es/tag";
import sortBy from "lodash/sortBy";
import moment from "moment";
import React from "react";
import JSONTree from "react-json-tree";

import "./index.css";

interface IProps {
    title?: React.ReactNode;
    operationLogs: IOperationLog[];
}

export default class OperationLogsList extends React.Component<IProps> {
    getColumns(): ColumnProps<IOperationLog>[] {
        return [
            {
                key: "operation",
                title: "Operation",
                dataIndex: "operation",
                align: "center",
                className: "c-OperationLogsList-operation-cell",
                render: (operation: Operation) => {
                    const prettifiedOperation = operation.replace(":", "-");
                    return (
                        <Tag className={prettifiedOperation}>
                            {prettifiedOperation}
                        </Tag>
                    );
                }
            },
            {
                key: "performedAt",
                title: "Performed at",
                dataIndex: "performedAt",
                className: "c-OperationLogsList-performedAt-cell",
                render: (performedAt: string) =>
                    moment(performedAt).format("YYYY-MM-DD HH:mm:ss Z")
            },
            {
                key: "performedBy",
                title: "Performed by",
                dataIndex: "performedBy",
                className: "c-OperationLogsList-performedBy-cell"
            }
        ];
    }

    renderTitle() {
        return this.props.title ? <h4>{this.props.title}</h4> : null;
    }

    renderDetails(operationLog: IOperationLog) {
        return (
            <div className="c-OperationLogsList-details">
                <h4>{"Parameters"}</h4>
                <JSONTree
                    theme="monokai"
                    data={operationLog.parameters}
                    hideRoot={true}
                />
            </div>
        );
    }

    render() {
        return (
            <div className="c-OperationLogsList">
                {this.renderTitle()}
                <Table<IOperationLog>
                    columns={this.getColumns()}
                    expandedRowRender={this.renderDetails}
                    dataSource={sortBy(
                        this.props.operationLogs,
                        "performedAt"
                    ).reverse()}
                    size="small"
                    bordered={false}
                    rowKey="id"
                    pagination={{ pageSize: 15 }}
                />
            </div>
        );
    }
}
