import React, { useState } from "react";
import { Typography, Space, Divider, Row, Col } from "antd";
import {
    Search,
    User,
    Mail,
    Lock,
    Heart,
    Star,
    Download
} from "lucide-react";
import { Button, Input, TextArea, Password, SearchInput, Card, CardHeader, CardBody, CardFooter } from "../../components/ui";

const { Title, Text, Paragraph } = Typography;

const ComponentsDemo: React.FC = () => {
    const [inputValue, setInputValue] = useState("");
    const [textAreaValue, setTextAreaValue] = useState("");
    const [searchValue, setSearchValue] = useState("");

    return (
        <div className="min-h-full bg-bg academic-canvas">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <Title level={1} className="text-gray-900 dark:text-secondary-100 mb-3">
                        UI Components Demo
                    </Title>
                    <Text className="text-gray-600 dark:text-secondary-400 text-lg">
                        Showcase of custom Button, Input, and Card components
                    </Text>
                </div>

                {/* Button Section */}
                <Card variant="outlined" className="mb-8">
                    <CardHeader
                        title="Button Components"
                        subtitle="Various button styles and states"
                    />
                    <CardBody>
                        <Space direction="vertical" size="large" className="w-full">
                            {/* Button Variants */}
                            <div>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Button Variants
                                </Text>
                                <Space wrap>
                                    <Button variant="primary">Primary</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="danger">Danger</Button>
                                </Space>
                            </div>

                            <Divider />

                            {/* Button Sizes */}
                            <div>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Button Sizes
                                </Text>
                                <Space wrap>
                                    <Button size="small">Small</Button>
                                    <Button size="middle">Middle</Button>
                                    <Button size="large">Large</Button>
                                </Space>
                            </div>

                            <Divider />

                            {/* Buttons with Icons */}
                            <div>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Buttons with Icons
                                </Text>
                                <Space wrap>
                                    <Button icon={<Heart className="w-4 h-4" />}>Like</Button>
                                    <Button icon={<Star className="w-4 h-4" />} variant="outline">Favorite</Button>
                                    <Button icon={<Download className="w-4 h-4" />} variant="secondary">Download</Button>
                                    <Button icon={<User className="w-4 h-4" />} variant="ghost">Profile</Button>
                                </Space>
                            </div>

                            <Divider />

                            {/* Loading Buttons */}
                            <div>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Loading States
                                </Text>
                                <Space wrap>
                                    <Button loading>Loading...</Button>
                                    <Button loading variant="outline">Submitting</Button>
                                    <Button loading variant="danger">Deleting</Button>
                                </Space>
                            </div>
                        </Space>
                    </CardBody>
                </Card>

                {/* Input Section */}
                <Card variant="outlined" className="mb-8">
                    <CardHeader
                        title="Input Components"
                        subtitle="Text inputs, text areas, and search inputs"
                    />
                    <CardBody>
                        <Row gutter={[24, 24]}>
                            {/* Basic Inputs */}
                            <Col xs={24} md={12}>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Basic Input
                                </Text>
                                <Input
                                    label="Username"
                                    placeholder="Enter your username"
                                    prefix={<User className="w-4 h-4" />}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                            </Col>

                            <Col xs={24} md={12}>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Input with Error
                                </Text>
                                <Input
                                    label="Email"
                                    placeholder="Enter your email"
                                    prefix={<Mail className="w-4 h-4" />}
                                    error="Please enter a valid email address"
                                />
                            </Col>

                            <Col xs={24} md={12}>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Password Input
                                </Text>
                                <Password
                                    label="Password"
                                    placeholder="Enter your password"
                                    prefix={<Lock className="w-4 h-4" />}
                                />
                            </Col>

                            <Col xs={24} md={12}>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Search Input
                                </Text>
                                <SearchInput
                                    label="Search"
                                    placeholder="Search anything..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </Col>

                            <Col xs={24}>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Text Area
                                </Text>
                                <TextArea
                                    label="Description"
                                    placeholder="Write a detailed description..."
                                    rows={4}
                                    showCount
                                    maxLength={500}
                                    value={textAreaValue}
                                    onChange={(e) => setTextAreaValue(e.target.value)}
                                />
                            </Col>

                            {/* Input Variants */}
                            <Col xs={24}>
                                <Divider />
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Input Variants
                                </Text>
                                <Row gutter={16}>
                                    <Col xs={24} sm={8}>
                                        <Input variant="outlined" placeholder="Outlined" />
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Input variant="filled" placeholder="Filled" />
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Input variant="borderless" placeholder="Borderless" />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* Card Section */}
                <Card variant="outlined" className="mb-8">
                    <CardHeader
                        title="Card Components"
                        subtitle="Different card styles and layouts"
                    />
                    <CardBody>
                        <Row gutter={[24, 24]}>
                            {/* Default Card */}
                            <Col xs={24} md={8}>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Default Card
                                </Text>
                                <Card>
                                    <CardHeader title="Card Title" subtitle="Card subtitle" />
                                    <CardBody>
                                        <Paragraph>
                                            This is a default card with some sample content.
                                            Cards are great for organizing information.
                                        </Paragraph>
                                    </CardBody>
                                    <CardFooter>
                                        <Button size="small">Cancel</Button>
                                        <Button size="small" variant="primary">Confirm</Button>
                                    </CardFooter>
                                </Card>
                            </Col>

                            {/* Outlined Card */}
                            <Col xs={24} md={8}>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Outlined Card
                                </Text>
                                <Card variant="outlined" hoverable>
                                    <CardHeader
                                        title="Hoverable Card"
                                        extra={<Button size="small" variant="ghost">More</Button>}
                                    />
                                    <CardBody>
                                        <Paragraph>
                                            This card has an outlined style and is hoverable.
                                            Try hovering over it to see the effect.
                                        </Paragraph>
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Borderless Card */}
                            <Col xs={24} md={8}>
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Borderless Card
                                </Text>
                                <Card variant="borderless" padding="large">
                                    <div className="text-center">
                                        <Heart className="w-10 h-10 text-red-500 mb-4" />
                                        <Title level={4}>Borderless Style</Title>
                                        <Paragraph className="text-gray-600">
                                            A clean borderless card design for minimal layouts.
                                        </Paragraph>
                                    </div>
                                </Card>
                            </Col>

                            {/* Different Padding */}
                            <Col xs={24}>
                                <Divider />
                                <Text strong className="block mb-4 text-gray-700 dark:text-gray-300">
                                    Card Padding Options
                                </Text>
                                <Row gutter={16}>
                                    <Col xs={24} sm={6}>
                                        <Card padding="none" className="bg-blue-50 dark:bg-blue-900/20">
                                            <div className="p-2 text-center">No Padding</div>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={6}>
                                        <Card padding="small" className="bg-green-50 dark:bg-green-900/20">
                                            <div className="text-center">Small Padding</div>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={6}>
                                        <Card padding="medium" className="bg-yellow-50 dark:bg-yellow-900/20">
                                            <div className="text-center">Medium Padding</div>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={6}>
                                        <Card padding="large" className="bg-purple-50 dark:bg-purple-900/20">
                                            <div className="text-center">Large Padding</div>
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* Usage Examples */}
                <Card variant="outlined">
                    <CardHeader
                        title="Usage Examples"
                        subtitle="How to import and use these components"
                    />
                    <CardBody>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                            <Text code className="block mb-2">
                                {"import { Button, Input, Card } from '../components/ui';"}
                            </Text>
                            <Text code className="block mb-2">
                                {"<Button variant='primary' size='large'>Click me</Button>"}
                            </Text>
                            <Text code className="block mb-2">
                                {"<Input label='Email' placeholder='Enter email' />"}
                            </Text>
                            <Text code>
                                {"<Card variant='outlined'><CardHeader title='Title' /></Card>"}
                            </Text>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default ComponentsDemo;