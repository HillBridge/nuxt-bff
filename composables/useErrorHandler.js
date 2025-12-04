/**
 * 统一错误处理组合式函数
 */
export const useErrorHandler = () => {
  const showError = (error) => {
    const errorMessage = error?.data?.message || error?.message || '发生未知错误';
    const statusCode = error?.statusCode || error?.status || 500;

    // 可以根据不同错误类型进行不同处理
    if (statusCode === 401) {
      // 未授权错误
      return {
        type: 'auth',
        message: '登录已过期，请重新登录',
        action: () => navigateTo('/login')
      };
    }

    if (statusCode === 403) {
      // 禁止访问
      return {
        type: 'forbidden',
        message: '您没有权限访问此资源',
        action: () => navigateTo('/')
      };
    }

    if (statusCode === 404) {
      // 资源不存在
      return {
        type: 'notFound',
        message: '请求的资源不存在',
        action: () => navigateTo('/')
      };
    }

    // 其他错误
    return {
      type: 'error',
      message: errorMessage,
      action: null
    };
  };

  const handleApiError = async (error) => {
    const errorInfo = showError(error);

    // 如果是认证错误，自动执行跳转
    if (errorInfo.type === 'auth' && errorInfo.action) {
      await errorInfo.action();
    }

    return errorInfo;
  };

  return {
    showError,
    handleApiError
  };
};

