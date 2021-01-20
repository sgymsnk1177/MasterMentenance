import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  FormControl,
  Table,
  Button,
  InputGroup,
  Alert,
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import { DataKbnSelect } from '../elemetes/Select';
import { chekInputData, sleep } from '../util/Common';

const MailingList = () => {
  const currentKbn = useRef('');
  const inputUserName = useRef();
  const inputMailAdress = useRef();

  const [dispError, setDispError] = useState('0');
  const [updateItem, setUpdateItem] = useState({});
  const [dataKbnList, setDataKbnlist] = useState([]);
  const [dataList, setDatalist] = useState([]);

  useEffect(() => {
    getDataKbn();
  }, []);

  useEffect(() => {
    inputUserName.current.value = '';
    inputMailAdress.current.value = '';
    if (updateItem) {
      inputUserName.current.value = updateItem.USER_NAME || '';
      inputMailAdress.current.value = updateItem.MAIL_ADDRESS || '';
    }
  }, [dataList, updateItem]);

  // useEffect(() => {
  //   if (updateItem) {
  //     inputUserName.current.value = updateItem.USER_NAME || '';
  //     inputMailAdress.current.value = updateItem.MAIL_ADDRESS || '';
  //   }
  // }, [updateItem]);

  const getDataKbn = async () => {
    try {
      const response = await fetch('mastermentenance?TYPE=GET_DATA_KBN');
      const data = await response.json();

      setDataKbnlist(data.LIST || []);
    } catch {
      setDataKbnlist([]);
    }
  };

  const handleKbnSelect = useCallback((e) => {
    currentKbn.current = e.target.value;
    getMailingList();
  }, []);

  const getMailingList = async () => {
    try {
      const response = await fetch('mastermentenance?TYPE=GET&DATA_KBN=' + currentKbn.current);
      const data = await response.json();
      //console.log(data);

      setDatalist(data.LIST || []);
    } catch {
      setDatalist([]);
    }
    handleReset();
  };

  const handleSelectUpdate = (item) => {
    console.log(item);
    setUpdateItem(item);
  };

  const handleReset = () => {
    setUpdateItem({});
  };

  const handleSubmitDeleteItem = async ({ ID }) => {
    const fd = new FormData();
    fd.append('TYPE', 'DELETE');
    fd.append('ID', ID);
    //fd.append('ITEM', JSON.stringify({ item }));

    const response = await fetch('mastermentenance', {
      method: 'POST',
      body: fd,
    });
    const data = await response.json();

    if (!data.RES) {
      alert('削除に失敗しました');
      return false;
    }

    setDatalist((oldData) => {
      return oldData.filter((v) => v.ID !== ID);
    });

    handleReset();
  };

  const handleSubumitUpdate = async () => {
    if (
      !chekInputData(inputUserName.current.value, inputMailAdress.current.value)
    ) {
      setDispError('1');
      // Alert表示
      sleep(2000).then(() => {
        setDispError('0');
      });
      return false;
    }

    const fd = new FormData();
    fd.append('TYPE', Object.keys(updateItem).length ? 'UPDATE' : 'INSERT');
    fd.append(
      'ITEM',
      JSON.stringify({
        ...updateItem,
        DATA_KBN: currentKbn.current,
        USER_NAME: inputUserName.current.value,
        MAIL_ADDRESS: inputMailAdress.current.value,
      })
    );

    const response = await fetch('mastermentenance', {
      method: 'POST',
      body: fd,
    });
    const data = await response.json();
    console.log(data);

    if (!data.RES) {
      alert('データの登録・更新に失敗しました。');
      return false;
    }

    if (Object.keys(updateItem).length) {
      const newDataList =
        dataList.map((v, i) => {
          console.log(v);
          if (v.ID === updateItem.ID) {
            v.USER_NAME = inputUserName.current.value;
            v.MAIL_ADDRESS = inputMailAdress.current.value;
          }
          return v;
        }) || [];
      console.log(newDataList);
      setDatalist(newDataList);
    } else {
      setDatalist((oldData) => {
        return [...oldData, data.ITEM];
      });
    }

    handleReset();
  };

  return (
    <div>
      <div style={{ margin: 15 }}>メーリングリスト</div>
      <div>
        <Container>
          <Row md={5}>
            <Col xs={12} md={8}>
              <DataKbnSelect
                onChange={handleKbnSelect}
                dataList={dataKbnList}
                currentKbn={currentKbn.current}
              />
            </Col>
            <Col xs={6} md={4}>
              {/* <div style={{ paddingBottom: 10 }}>
                <Button
                  className='btn'
                  variant='primary'
                  size='sm'
                  onClick={getMailingList}
                >
                  検 索
                </Button>
              </div> */}
            </Col>
          </Row>
        </Container>
      </div>

      <Table striped bordered hover size='sm'>
        <thead>
          <tr>
            <th>区分</th>
            <th>対象者</th>
            <th>メールアドレス</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          {dataList &&
            dataList.map((item, index) => (
              <tr key={index}>
                <td>{item.DATA_KBN}</td>
                <td>{item.USER_NAME}</td>
                <td>{item.MAIL_ADDRESS}</td>
                <td>
                  <Button
                    className='btn'
                    variant='outline-success'
                    onClick={() => handleSelectUpdate(item)}
                  >
                    修正
                  </Button>
                  <Button
                    className='btn'
                    variant='outline-danger'
                    onClick={() => handleSubmitDeleteItem(item)}
                  >
                    削除
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      <div style={{ flexDirection: 'row' }}>
        <Container>
          <Row>
            <Col>
              <InputGroup size='sm' className='mb-3 input-area'>
                <InputGroup.Prepend>
                  <InputGroup.Text id='inputGroup-sizing-sm'>
                    対象者
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  aria-label='Small'
                  aria-describedby='inputGroup-sizing-sm'
                  ref={inputUserName}
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup size='sm' className='mb-3 input-area'>
                <InputGroup.Prepend>
                  <InputGroup.Text id='inputGroup-sizing-sm'>
                    メールアドレス
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  aria-label='Small'
                  aria-describedby='inputGroup-sizing-sm'
                  ref={inputMailAdress}
                />
              </InputGroup>
            </Col>
          </Row>
        </Container>

        <Container>
          <Row>
            <Col>
              <input
                type='hidden'
                style={{ width: '100px' }}
                readOnly
                defaultValue={
                  Object.keys(updateItem).length ? updateItem.KEY : ''
                }
              />
            </Col>
            <Col></Col>
            <Col>
              <Button
                // className='btn flex-end mr-20'
                variant='secondary'
                size='lg'
                block
                style={{ width: 300 }}
                onClick={handleReset}
              >
                クリア
              </Button>
              <Button
                // className='btn flex-end'
                variant={Object.keys(updateItem).length ? 'success' : 'info'}
                size='lg'
                block
                style={{ width: 300 }}
                onClick={handleSubumitUpdate}
              >
                {Object.keys(updateItem).length ? '修 正' : '登 録'}
              </Button>
            </Col>
          </Row>
        </Container>

        {dispError === '1' && (
          <Alert variant='danger'>
            対象者名または、メールアドレスを正しく入力してください。
          </Alert>
        )}
      </div>
    </div>
  );
};

export default MailingList;
