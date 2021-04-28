import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  FormControl,
  Table,
  Button,
  ButtonGroup,
  InputGroup,
  Alert,
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import { DataKbnSelect } from '../elemetes/Select';
import { checkInputData, sleep } from '../util/Common';

const MailingList = () => {
  const currentKbn = useRef('');
  const inputUserName = useRef();
  const inputMailAddress = useRef();

  const [dispError, setDispError] = useState('0');
  const [updateItem, setUpdateItem] = useState({});
  const [dataKbnList, setDataKbnList] = useState([]);
  const [dataList, setDatalist] = useState([]);

  useEffect(() => {
    getDataKbn();
  }, []);

  useEffect(() => {
    inputUserName.current.value = '';
    inputMailAddress.current.value = '';
    if (updateItem) {
      inputUserName.current.value = updateItem.USER_NAME || '';
      inputMailAddress.current.value = updateItem.MAIL_ADDRESS || '';
    }
  }, [dataList, updateItem]);

  const getDataKbn = async () => {
    try {
      const response = await fetch('mastermentenance?TYPE=GET_DATA_KBN');
      // const response = await fetch(
      //   'http://192.168.1.212/WebApi/EpalKyotenRegWebApi/api/GetHaisoList?haiso_kana=%EF%BD%B1',
      //   {
      //     method: 'GET',
      //     // mode: 'cors',
      //     // credentials: 'include',
      //     headers: {
      //       'Access-Control-Allow-Headers': 'Content-Type',
      //       'Access-Control-Allow-Origin': 'http://192.168.1.212',
      //       'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      //     },
      //   }
      // );
      const data = await response.json();

      setDataKbnList(data.LIST || []);
    } catch {
      setDataKbnList([]);
    }
  };

  const handleKbnSelect = useCallback(
    (e) => {
      currentKbn.current = e.target.value;
      getMailingList();
    },
    [currentKbn]
  );

  const getMailingList = async () => {
    try {
      const response = await fetch(
        'mastermentenance?TYPE=GET&DATA_KBN=' + currentKbn.current
      );
      const data = await response.json();

      setDatalist(data.LIST || []);
    } catch {
      setDatalist([]);
    }
    handleReset();
  };

  const handleSelectUpdate = (item) => {
    setUpdateItem(item);
  };

  const handleReset = () => {
    setUpdateItem({});
  };

  const handleItemMode = (index, at) => {
    // console.log(index, at);
    if (
      (index === 0 && at === -1) ||
      (index === dataList.length - 1 && at === 1)
    ) {
      return false;
    }
    if (dataList && dataList.length > 1) {
      const item = dataList[index];
      const tempList = [...dataList].filter((v, i) => i !== index);

      const targetIndex = index + at;
      const newList = [];
      tempList.forEach((v, i) => {
        if (i === targetIndex) {
          newList.push(item);
        }
        newList.push(v);
      });

      setDatalist(newList);
    }
  };

  const handleSubmitDeleteItem = async ({ ID }) => {
    const result = window.confirm('削除実行しますか？');
    if (!result) {
      return false;
    }

    const fd = new FormData();
    fd.append('TYPE', 'DELETE');
    fd.append('ID', ID);
    // console.log(...fd.entries());

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

  const handleSubmitUpdate = async () => {
    if (
      !checkInputData(
        inputUserName.current.value,
        inputMailAddress.current.value
      )
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
        MAIL_ADDRESS: inputMailAddress.current.value,
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
            v.MAIL_ADDRESS = inputMailAddress.current.value;
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

  const handleSubmitSeq = async () => {
    const data = dataList.map((v, i) => {
      return { HYOJI_JUN: i + 1, ID: v.ID };
    });
    console.log({ data });

    const fd = new FormData();
    fd.append('TYPE', 'SEQ_UPDATE');
    fd.append('LIST', JSON.stringify(data));

    const response = await fetch('mastermentenance', {
      method: 'POST',
      body: fd,
    });
    const result = await response.json();

    if (!result.RES) {
      window.alert('並び順変更に失敗しました。再度行ってください');
    }
  };

  return (
    <div>
      <div style={{ margin: 15 }}>メーリングリスト</div>

      <Container className='themed-container' fluid={true}>
        <Row>
          <Col sm={10}>
            <DataKbnSelect
              onChange={handleKbnSelect}
              dataList={dataKbnList}
              currentKbn={currentKbn.current}
            />
          </Col>
          <Col sm={2}>
            <Button
              disabled={dataList.length === 0}
              className='btn_w'
              size='sm'
              variant='info'
              onClick={() => handleSubmitSeq()}
            >
              並び順確定
            </Button>
          </Col>
        </Row>
      </Container>

      <Table bordered striped hover size='sm'>
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
              <tr key={item.ID}>
                <td>{item.DATA_KBN}</td>
                <td>{item.USER_NAME}</td>
                <td>{item.MAIL_ADDRESS}</td>
                <td>
                  <Button
                    className='btn'
                    size='sm'
                    variant='outline-success'
                    onClick={() => handleSelectUpdate(item)}
                  >
                    修正
                  </Button>
                  <Button
                    className='btn'
                    size='sm'
                    variant='outline-danger'
                    onClick={() => handleSubmitDeleteItem(item)}
                  >
                    削除
                  </Button>
                  <ButtonGroup size='sm'>
                    <Button
                      // className='btn'
                      size='sm'
                      variant='outline-info'
                      onClick={() => handleItemMode(index, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      // className='btn'
                      size='sm'
                      variant='outline-info'
                      onClick={() => handleItemMode(index, 1)}
                    >
                      ↓
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
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
                ref={inputMailAddress}
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
              onClick={handleSubmitUpdate}
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
  );
};

export default MailingList;
