import { Button, Result, Typography } from 'antd';

const { Paragraph, Text } = Typography;

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * A user-friendly component to display when a critical rendering error occurs.
 * It provides the user with information and a way to reset the application state.
 */
export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <Result
      status='error'
      title='Something Went Wrong'
      subTitle='An unexpected error occurred. Please try resetting the application.'
      style={{ margin: 'auto', padding: '50px' }}
      extra={[
        <Button type='primary' key='reset' onClick={resetErrorBoundary}>
          Try Again
        </Button>,
      ]}
    >
      <div
        style={{
          background: 'rgba(255, 0, 0, 0.05)',
          border: '1px solid rgba(255, 0, 0, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'left',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <Paragraph>
          <Text strong>Error Details:</Text>
        </Paragraph>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '12px' }}>
          {error.message}
        </pre>
      </div>
    </Result>
  );
};
