import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { TableWrapper } from '../../../components/ui/table-wrapper';
import { Button } from '../../../components/ui/button';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Tag } from '../../../components/ui/tag';
import { Statistic } from '../../../components/ui/statistic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Alert } from '../../../components/ui/alert';
import { Avatar } from '../../../components/ui/avatar';
import { List } from '../../../components/ui/list';
import { Separator } from '../../../components/ui/separator';
import { Badge } from '../../../components/ui/badge-count';
import { Progress } from '../../../components/ui/progress';
import { Tooltip } from '../../../components/ui/tooltip';
import { Empty } from '../../../components/ui/empty';
import { Descriptions } from '../../../components/ui/descriptions';
import { Drawer } from '../../../components/ui/drawer';
import { DatePicker } from '../../../components/ui/date-picker';
import { InputNumber } from '../../../components/ui/input-number';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import {
  Bug,
  Plus,
  Edit,
  Trash2,
  Eye,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings,
  FileText,
  Download,
  RotateCw,
  Square,
  Home,
  PauseCircle,
  BarChart3,
  History,
  XCircle,
  Loader2
} from 'lucide-react';
import dayjs from 'dayjs';
import { useNotification } from '../../../hooks/useNotification';
import { Textarea } from '../../../components/ui/textarea';
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
// import testingData from '../../../data/testing.json'; // File removed during cleanup
const Testing = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [formValues, setFormValues] = useState({
    name: '',
    type: 'unit',
    priority: 'medium',
    status: 'pending',
    description: '',
    steps: '',
    expectedResult: '',
    environment: '',
    browser: '',
    os: ''
  });
  const [tests, setTests] = useState([]);
  const [testRuns, setTestRuns] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedTestRun, setSelectedTestRun] = useState(null);
  const [runDrawerVisible, setRunDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Load data from JSON file - using mock data since testing.json was removed
  const initialTests = []; // Mock empty data
  const initialTestRuns = []; // Mock empty data

  useEffect(() => {
    setTests(initialTests);
    setTestRuns(initialTestRuns);
  }, []);

  const stats = [
    {
      title: 'Tổng test cases',
      value: tests.length,
      icon: <Bug className="h-5 w-5" />,
      color: '#1890ff'
    },
    {
      title: 'Đã pass',
      value: tests.filter(t => t.status === 'passed').length,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: '#52c41a'
    },
    {
      title: 'Coverage TB',
      value: tests.length > 0 ? `${Math.round(tests.reduce((sum, t) => sum + (t.coverage || 0), 0) / tests.length)}%` : '0%',
      icon: <FileText className="h-5 w-5" />,
      color: '#722ed1'
    },
    {
      title: 'Test runs',
      value: testRuns.length,
      icon: <PlayCircle className="h-5 w-5" />,
      color: '#fa8c16'
    }
  ];

  const handleCreateTest = () => {
    setIsEditMode(false);
    setSelectedTest(null);
    setFormValues({
      name: '',
      type: 'unit',
      priority: 'medium',
      status: 'pending',
      description: '',
      steps: '',
      expectedResult: '',
      environment: '',
      browser: '',
      os: ''
    });
    setIsModalVisible(true);
  };

  const handleEditTest = (test) => {
    setIsEditMode(true);
    setSelectedTest(test);
    setFormValues({
      name: test.name || '',
      type: test.type || 'unit',
      priority: test.priority || 'medium',
      status: test.status || 'pending',
      description: test.description || '',
      steps: test.steps || '',
      expectedResult: test.expectedResult || '',
      environment: test.environment || '',
      browser: test.browser || '',
      os: test.os || ''
    });
    setIsModalVisible(true);
  };

  const handleViewTest = (test) => {
    setSelectedTest(test);
    setDetailDrawerVisible(true);
  };

  const handleDeleteTest = (testId) => {
    setTests(tests.filter(test => test.id !== testId));
    showNotification('success', 'Thành công', 'Đã xóa test case thành công!');
  };

  const handleRunTest = (test) => {
    setTests(tests.map(t =>
      t.id === test.id
        ? { ...t, status: 'running', lastRun: dayjs().format('YYYY-MM-DD HH:mm:ss') }
        : t
    ));
    showNotification('info', 'Thông tin', `Đang chạy test: ${test.name}`);

    // Simulate test running
    setTimeout(() => {
      const newStatus = Math.random() > 0.3 ? 'passed' : 'failed';
      setTests(tests.map(t =>
        t.id === test.id
          ? { ...t, status: newStatus, duration: `${(Math.random() * 20 + 5).toFixed(1)}s` }
          : t
      ));
      showNotification('success', 'Thành công', `Test ${test.name} ${newStatus === 'passed' ? 'passed' : 'failed'}!`);
    }, 3000);
  };

  const handleRunAllTests = () => {
    setLoading(true);
    showNotification('info', 'Thông tin', 'Đang chạy tất cả tests...');

    setTimeout(() => {
      setTests(tests.map(test => ({
        ...test,
        status: Math.random() > 0.2 ? 'passed' : 'failed',
        duration: `${(Math.random() * 20 + 5).toFixed(1)}s`,
        lastRun: dayjs().format('YYYY-MM-DD HH:mm:ss')
      })));
      setLoading(false);
      showNotification('success', 'Thành công', 'Đã chạy xong tất cả tests!');
    }, 5000);
  };

  const handleModalOk = () => {
    // Validate
    if (!formValues.name?.trim()) {
      showNotification('error', 'Lỗi', 'Vui lòng nhập tên test case!');
      return;
    }
    if (!formValues.type) {
      showNotification('error', 'Lỗi', 'Vui lòng chọn loại test!');
      return;
    }
    if (!formValues.priority) {
      showNotification('error', 'Lỗi', 'Vui lòng chọn mức độ ưu tiên!');
      return;
    }
    if (!formValues.status) {
      showNotification('error', 'Lỗi', 'Vui lòng chọn trạng thái!');
      return;
    }

    if (isEditMode) {
      setTests(tests.map(test =>
        test.id === selectedTest.id
          ? { ...test, ...formValues, lastRun: dayjs().format('YYYY-MM-DD HH:mm:ss') }
          : test
      ));
      showNotification('success', 'Thành công', 'Cập nhật test case thành công!');
    } else {
      const newTest = {
        id: Date.now(),
        ...formValues,
        duration: '0s',
        coverage: 0,
        lastRun: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        status: 'pending'
      };
      setTests([...tests, newTest]);
      showNotification('success', 'Thành công', 'Thêm test case thành công!');
    }
    setIsModalVisible(false);
    setFormValues({
      name: '',
      type: 'unit',
      priority: 'medium',
      status: 'pending',
      description: '',
      steps: '',
      expectedResult: '',
      environment: '',
      browser: '',
      os: ''
    });
    setIsEditMode(false);
    setSelectedTest(null);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setFormValues({
      name: '',
      type: 'unit',
      priority: 'medium',
      status: 'pending',
      description: '',
      steps: '',
      expectedResult: '',
      environment: '',
      browser: '',
      os: ''
    });
    setIsEditMode(false);
    setSelectedTest(null);
  };

  const handleViewTestRun = (testRun) => {
    setSelectedTestRun(testRun);
    setRunDrawerVisible(true);
  };

  const getFilteredTests = () => {
    return tests.filter(test => {
      const searchMatch = test.name.toLowerCase().includes(searchText.toLowerCase()) ||
        test.description.toLowerCase().includes(searchText.toLowerCase());
      const statusMatch = statusFilter === 'all' || test.status === statusFilter;
      const typeMatch = typeFilter === 'all' || test.type === typeFilter;
      const priorityMatch = priorityFilter === 'all' || test.priority === priorityFilter;

      return searchMatch && statusMatch && typeMatch && priorityMatch;
    });
  };

  const columns = [
    {
      title: 'Test Case',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#262626' }}>{text}</div>
          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{record.description}</div>
        </div>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeConfig = {
          unit: { color: 'green', text: 'Unit Test', icon: <Bug className="h-4 w-4" /> },
          integration: { color: 'blue', text: 'Integration Test', icon: <Settings className="h-4 w-4" /> },
          e2e: { color: 'purple', text: 'E2E Test', icon: <PlayCircle className="h-4 w-4" /> }
        };
        const config = typeConfig[type] || { color: 'default', text: type };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const priorityConfig = {
          high: { color: 'red', text: 'Cao' },
          medium: { color: 'orange', text: 'Trung bình' },
          low: { color: 'blue', text: 'Thấp' }
        };
        const config = priorityConfig[priority] || { color: 'default', text: priority };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          passed: { color: 'green', text: 'Passed', icon: <CheckCircle2 className="h-4 w-4" /> },
          failed: { color: 'red', text: 'Failed', icon: <XCircle className="h-4 w-4" /> },
          pending: { color: 'orange', text: 'Pending', icon: <Clock className="h-4 w-4" /> },
          running: { color: 'blue', text: 'Running', icon: <PlayCircle className="h-4 w-4" /> }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => (
        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
          {duration}
        </div>
      )
    },
    {
      title: 'Coverage',
      key: 'coverage',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#262626' }}>{record.coverage}%</div>
          <Progress
            percent={record.coverage}
            size="small"
            className={styles['testing-progress']}
          />
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip content="Chạy test">
            <Button
              variant="ghost"
              size="sm"
              className={styles['testing-button']}
              onClick={() => handleRunTest(record)}
              disabled={record.status === 'running'}
            >
              {record.status === 'running' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
            </Button>
          </Tooltip>
          <Tooltip content="Xem chi tiết">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewTest(record)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Chỉnh sửa">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditTest(record)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Xóa">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa test case này?')) {
                  handleDeleteTest(record.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ];

  const runColumns = [
    {
      title: 'Test Run',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#262626' }}>{text}</div>
          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
            {record.createdAt}
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          completed: { color: 'green', text: 'Hoàn thành', icon: <CheckCircle2 className="h-4 w-4" /> },
          running: { color: 'blue', text: 'Đang chạy', icon: <PlayCircle className="h-4 w-4" /> },
          failed: { color: 'red', text: 'Thất bại', icon: <XCircle className="h-4 w-4" /> }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: 'Kết quả',
      key: 'results',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Pass: {record.passed} | Fail: {record.failed} | Skip: {record.skipped}
          </div>
          <Progress
            percent={Math.round((record.passed / record.totalTests) * 100)}
            size="small"
            className={styles['testing-progress']}
          />
        </div>
      )
    },
    {
      title: 'Coverage',
      dataIndex: 'coverage',
      key: 'coverage',
      render: (coverage) => (
        <div>
          <div style={{ fontWeight: 600, color: '#262626' }}>{coverage}%</div>
          <Progress
            percent={coverage}
            size="small"
            className={styles['testing-progress']}
          />
        </div>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => (
        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
          {duration}
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip content="Xem chi tiết">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewTestRun(record)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Tải xuống">
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className={styles['testing-container']}>
      {/* Breadcrumb */}
      <Breadcrumb
        className="mb-4"
        items={[
          {
            title: (
              <span
                onClick={() => navigate('/admin/dashboard')}
                className="cursor-pointer hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" /> Dashboard
              </span>
            ),
          },
          {
            title: 'Testing',
          },
        ]}
      />

      <div className={styles['testing-header']}>
        <h2 className={styles['testing-title']}>
          Quản lý testing
        </h2>
        <p className={styles['testing-subtitle']}>
          Quản lý test cases, test runs và báo cáo chất lượng
        </p>
      </div>

      <div className={styles['quick-stats']}>
        {stats.map((stat, index) => (
          <div key={index} className={styles['stat-card']}>
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={stat.icon}
              valueStyle={{ color: stat.color }}
            />
          </div>
        ))}
      </div>

      <Card className={styles['testing-card']}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h4 style={{ margin: 0 }}>Test Management</h4>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRunAllTests}
              disabled={loading}
              variant="outline"
              className={styles['testing-button-secondary']}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCw className="h-4 w-4 mr-2" />}
              Chạy tất cả
            </Button>
            <Button
              onClick={handleCreateTest}
              className={styles['testing-button'] + ' bg-indigo-600 hover:bg-indigo-700 text-white'}
            >
              <Plus className="h-4 w-4 mr-2" />
              + Thêm test case
            </Button>
          </div>
        </div>

        <Tabs defaultValue="tests" className={styles['testing-tabs']}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tests">Test Cases</TabsTrigger>
            <TabsTrigger value="runs">Test Runs</TabsTrigger>
            <TabsTrigger value="coverage">Test Coverage</TabsTrigger>
            <TabsTrigger value="reports">Báo cáo</TabsTrigger>
          </TabsList>
          <TabsContent value="tests">
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div className="sm:col-span-2">
                      <div className="relative">
                        <Bug className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Tìm kiếm test cases..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={typeFilter}
                      onValueChange={setTypeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Loại test" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value="unit">Unit Test</SelectItem>
                        <SelectItem value="integration">Integration Test</SelectItem>
                        <SelectItem value="e2e">E2E Test</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={priorityFilter}
                      onValueChange={setPriorityFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ưu tiên" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả ưu tiên</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="low">Thấp</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchText('');
                        setStatusFilter('all');
                        setTypeFilter('all');
                        setPriorityFilter('all');
                      }}
                      className="w-full"
                    >
                      <RotateCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>

                  <TableWrapper
                    columns={columns}
                    dataSource={getFilteredTests()}
                    rowKey="id"
                    pagination={{
                      current: 1,
                      pageSize: 10,
                      total: getFilteredTests().length,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} test cases`
                    }}
                  />
          </TabsContent>
          <TabsContent value="runs">
                <TableWrapper
                  columns={runColumns}
                  dataSource={testRuns}
                  rowKey="id"
                  pagination={{
                    current: 1,
                    pageSize: 10,
                    total: testRuns.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} test runs`
                  }}
                />
          </TabsContent>
          <TabsContent value="coverage">
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={styles['testing-card'] + ' p-4'}>
                      <h4 className="mb-4 font-semibold">Coverage theo module</h4>
                      <div className="space-y-3">
                        {[
                          { module: 'Authentication', coverage: 95 },
                          { module: 'Booking', coverage: 87 },
                          { module: 'Payment', coverage: 82 },
                          { module: 'Admin', coverage: 78 }
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{item.module}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{item.coverage}%</span>
                              <Progress value={item.coverage} className="w-20 h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card className={styles['testing-card'] + ' p-4'}>
                      <h4 className="mb-4 font-semibold">Test Execution Steps</h4>
                      <div className="space-y-4">
                        {[
                          { title: 'Setup Environment', description: 'Khởi tạo test environment', completed: true },
                          { title: 'Run Unit Tests', description: 'Chạy unit tests', completed: true },
                          { title: 'Run Integration Tests', description: 'Chạy integration tests', completed: false },
                          { title: 'Run E2E Tests', description: 'Chạy end-to-end tests', completed: false },
                          { title: 'Generate Report', description: 'Tạo báo cáo kết quả', completed: false }
                        ].map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                              {step.completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                            </div>
                            <div>
                              <h5 className="font-semibold">{step.title}</h5>
                              <p className="text-sm text-gray-500">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
          </TabsContent>
          <TabsContent value="reports">
            <div className="text-center py-10">
              <Empty description="Chưa có báo cáo nào" />
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Test Detail Drawer */}
      <Drawer
        title="Chi tiết Test Case"
        placement="right"
        width={600}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {selectedTest && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tên test case" span={1}>
              {selectedTest.name}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={1}>
              {selectedTest.description}
            </Descriptions.Item>
            <Descriptions.Item label="Loại test">
              <Tag color={
                selectedTest.type === 'unit' ? 'green' :
                  selectedTest.type === 'integration' ? 'blue' : 'purple'
              }>
                {selectedTest.type === 'unit' ? 'Unit Test' :
                  selectedTest.type === 'integration' ? 'Integration Test' : 'E2E Test'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ưu tiên">
              <Tag color={
                selectedTest.priority === 'high' ? 'red' :
                  selectedTest.priority === 'medium' ? 'orange' : 'blue'
              }>
                {selectedTest.priority === 'high' ? 'Cao' :
                  selectedTest.priority === 'medium' ? 'Trung bình' : 'Thấp'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={
                selectedTest.status === 'passed' ? 'green' :
                  selectedTest.status === 'failed' ? 'red' :
                    selectedTest.status === 'running' ? 'blue' : 'orange'
              }>
                {selectedTest.status === 'passed' ? 'Passed' :
                  selectedTest.status === 'failed' ? 'Failed' :
                    selectedTest.status === 'running' ? 'Running' : 'Pending'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian chạy">
              {selectedTest.duration}
            </Descriptions.Item>
            <Descriptions.Item label="Coverage">
              {selectedTest.coverage}%
            </Descriptions.Item>
            <Descriptions.Item label="Lần chạy cuối">
              {selectedTest.lastRun}
            </Descriptions.Item>
            <Descriptions.Item label="Environment">
              {selectedTest.environment}
            </Descriptions.Item>
            <Descriptions.Item label="Browser">
              {selectedTest.browser}
            </Descriptions.Item>
            <Descriptions.Item label="OS">
              {selectedTest.os}
            </Descriptions.Item>
            <Descriptions.Item label="Các bước thực hiện" span={1}>
              <p style={{ whiteSpace: 'pre-line' }}>{selectedTest.steps}</p>
            </Descriptions.Item>
            <Descriptions.Item label="Kết quả mong đợi" span={1}>
              {selectedTest.expectedResult}
            </Descriptions.Item>
            <Descriptions.Item label="Kết quả thực tế" span={1}>
              {selectedTest.actualResult}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Test Run Detail Drawer */}
      <Drawer
        title="Chi tiết Test Run"
        placement="right"
        width={600}
        onClose={() => setRunDrawerVisible(false)}
        open={runDrawerVisible}
      >
        {selectedTestRun && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tên test run" span={1}>
              {selectedTestRun.name}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={
                selectedTestRun.status === 'completed' ? 'green' :
                  selectedTestRun.status === 'running' ? 'blue' : 'red'
              }>
                {selectedTestRun.status === 'completed' ? 'Hoàn thành' :
                  selectedTestRun.status === 'running' ? 'Đang chạy' : 'Thất bại'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tests">
              {selectedTestRun.totalTests}
            </Descriptions.Item>
            <Descriptions.Item label="Passed">
              <span className="text-green-600 font-semibold">{selectedTestRun.passed}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Failed">
              <span className="text-red-600 font-semibold">{selectedTestRun.failed}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Skipped">
              <span className="text-gray-500">{selectedTestRun.skipped}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian chạy">
              {selectedTestRun.duration}
            </Descriptions.Item>
            <Descriptions.Item label="Coverage">
              {selectedTestRun.coverage}%
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedTestRun.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="Environment">
              {selectedTestRun.environment}
            </Descriptions.Item>
            <Descriptions.Item label="Triggered by">
              {selectedTestRun.triggeredBy}
            </Descriptions.Item>
            {selectedTestRun.details && (
              <>
                <Descriptions.Item label="Thời gian bắt đầu">
                  {selectedTestRun.details.startTime}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian kết thúc">
                  {selectedTestRun.details.endTime || 'Đang chạy...'}
                </Descriptions.Item>
                <Descriptions.Item label="Tỷ lệ thành công">
                  {selectedTestRun.details.successRate}%
                </Descriptions.Item>
                <Descriptions.Item label="Tỷ lệ thất bại">
                  {selectedTestRun.details.failureRate}%
                </Descriptions.Item>
                <Descriptions.Item label="Tỷ lệ bỏ qua">
                  {selectedTestRun.details.skipRate}%
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Drawer>

      <Modal
        title={isEditMode ? "Chỉnh sửa test case" : "Thêm test case mới"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleModalCancel}>
              Hủy
            </Button>
            <Button onClick={handleModalOk} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isEditMode ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        }
        width={800}
        className={styles['testing-modal']}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleModalOk(); }} className={styles['testing-form'] + ' space-y-4'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold">
                Tên test case <span className="text-red-500">*</span>
              </label>
              <Input
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                placeholder="Nhập tên test case"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">
                Loại test <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.type}
                onValueChange={(value) => setFormValues({ ...formValues, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại test" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit">Unit Test</SelectItem>
                  <SelectItem value="integration">Integration Test</SelectItem>
                  <SelectItem value="e2e">E2E Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-semibold">
                Mức độ ưu tiên <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.priority}
                onValueChange={(value) => setFormValues({ ...formValues, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mức độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2 font-semibold">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.status}
                onValueChange={(value) => setFormValues({ ...formValues, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2 font-semibold">Environment</label>
              <Input
                value={formValues.environment}
                onChange={(e) => setFormValues({ ...formValues, environment: e.target.value })}
                placeholder="VD: Chrome 120.0.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold">Browser</label>
              <Input
                value={formValues.browser}
                onChange={(e) => setFormValues({ ...formValues, browser: e.target.value })}
                placeholder="VD: Chrome"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Operating System</label>
              <Input
                value={formValues.os}
                onChange={(e) => setFormValues({ ...formValues, os: e.target.value })}
                placeholder="VD: Windows 10"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Mô tả</label>
            <Textarea
              value={formValues.description}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              rows={3}
              placeholder="Nhập mô tả test case"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Test Steps</label>
            <Textarea
              value={formValues.steps}
              onChange={(e) => setFormValues({ ...formValues, steps: e.target.value })}
              rows={4}
              placeholder="Nhập các bước thực hiện test"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Kết quả mong đợi</label>
            <Textarea
              value={formValues.expectedResult}
              onChange={(e) => setFormValues({ ...formValues, expectedResult: e.target.value })}
              rows={2}
              placeholder="Nhập kết quả mong đợi"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Testing; 