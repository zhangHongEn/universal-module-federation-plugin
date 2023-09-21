import React from 'react';
import Button from 'antd/es/Button'; // 加载 JS
import 'antd/es/Button/style/css'; // 加载 CSS
import Form from 'antd/es/Form'; // 加载 JS
import 'antd/es/Form/style/css'; // 加载 CSS
import Input from 'antd/es/Input'; // 加载 JS
import 'antd/es/Input/style/css'; // 加载 CSS
import "./index.css"
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import  parseRequest from 'package-request-parse'
import localStorage from "./getLocalStorage"

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 20,
      offset: 4,
    },
  },
};
const wpmAlias = (function () {
  try {
    return JSON.parse(localStorage.getItem("wpm-alias")) || []
  } catch (e) {
    return {}
  }
})()
const initialValues = {
  list: wpmAlias
}
const App = () => {
  const onFinish = (values) => {
    localStorage.setItem("wpm-alias", JSON.stringify(values.list.filter(item => item.source && item.target)))
    location.reload()
  };
  return (
    <div className="wpmjs-develop-alias">
    <Form
      initialValues={initialValues}
      name="dynamic_form_item"
      {...formItemLayoutWithOutLabel}
      onFinish={onFinish}
      style={{
        maxWidth: 600,
      }}
    >
      <Form.List
        name="list"
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => (
              <div style={{display: "flex", marginTop: 10}}>
                <Form.Item
                  name={[field.name, 'source']}
                  noStyle
                >
                  <Input
                    placeholder="package name"
                  />
                </Form.Item>
                <Form.Item
                  name={[field.name, 'target']}
                  noStyle
                >
                  <Input
                    placeholder="version"
                  />
                </Form.Item>
                
                <MinusCircleOutlined
                  className="dynamic-delete-button"
                  onClick={() => remove(field.name)}
                />
              </div>
            ))}
            <Form.ErrorList errors={errors} />
            <div style={{display: "flex", marginTop: 10}}>
              <Button
                type="dashed"
                onClick={() => add()}
                icon={<PlusOutlined />}
              >
                Add
              </Button>
              <Button type="primary" htmlType="submit">
                save
              </Button>
            </div>
          </>
        )}
      </Form.List>
    </Form>
    </div>
  );
};
export default App;