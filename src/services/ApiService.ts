import type { App } from "vue";
import type { AxiosResponse } from "axios";
import axios from "axios";
import VueAxios from "vue-axios";
import JwtService from "@/services/JwtService";

/**
 * @description service to call HTTP request via Axios
 */
class ApiService {
  /**
   * @description property to share vue instance
   */
  public static vueInstance: App;

  /**
   * @description initialize vue axios
   */
  public static init(app: App<Element>) {
  ApiService.vueInstance = app;
  ApiService.vueInstance.use(VueAxios, axios);

  ApiService.vueInstance.axios.defaults.baseURL =
    import.meta.env.VITE_APP_API;

  console.log("========================================");
  console.log("🚀 ApiService Initialized");
  console.log("Base URL:", ApiService.vueInstance.axios.defaults.baseURL);
  console.log("Environment:", import.meta.env.MODE);
  console.log("========================================");
}

  /**
   * @description set the default HTTP request headers
   */
  public static setHeader(): void {
    ApiService.vueInstance.axios.defaults.headers.common[
      "Authorization"
    ] = `Token ${JwtService.getToken()}`;
    ApiService.vueInstance.axios.defaults.headers.common["Accept"] =
      "application/json";
  }

  /**
   * @description send the GET HTTP request
   * @param resource: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static query(resource: string, params: any): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.get(resource, params);
  }

  /**
   * @description send the GET HTTP request
   * @param resource: string
   * @param slug: string
   * @returns Promise<AxiosResponse>
   */
  public static get(
    resource: string,
    slug = "" as string
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.get(`${resource}/${slug}`);
  }

  /**
   * @description set the POST HTTP request
   * @param resource: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static async post(
  resource: string,
  params: any
): Promise<AxiosResponse> {

  console.log("========================================");
  console.log("🚀 AXIOS POST");
  console.log("Base URL:", ApiService.vueInstance.axios.defaults.baseURL);
  console.log("Resource:", resource);
  console.log(
    "Full URL:",
    `${ApiService.vueInstance.axios.defaults.baseURL}${resource}`
  );
  console.log("Payload:", JSON.stringify(params, null, 2));
  console.log(
    "Default Headers:",
    ApiService.vueInstance.axios.defaults.headers
  );
  console.log("========================================");

  try {
    const response = await ApiService.vueInstance.axios.post(resource, params);

    console.log("========== RESPONSE ==========");
    console.log("Status:", response.status);
    console.log("Headers:", response.headers);
    console.log("Data:", JSON.stringify(response.data, null, 2));
    console.log("==============================");

    return response;
  } catch (error: any) {

    console.log("========== AXIOS ERROR ==========");
    console.log("Message:", error.message);
    console.log("Code:", error.code);

    if (error.config) {
      console.log("Request URL:", error.config.url);
      console.log("Request Method:", error.config.method);
      console.log("Request Headers:", error.config.headers);
      console.log("Request Data:", error.config.data);
    }

    if (error.response) {
      console.log("Response Status:", error.response.status);
      console.log("Response Headers:", error.response.headers);
      console.log(
        "Response Data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    console.log("==============================");

    throw error;
  }
}
  /**
   * @description send the UPDATE HTTP request
   * @param resource: string
   * @param slug: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static update(
    resource: string,
    slug: string,
    params: any
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.put(`${resource}/${slug}`, params);
  }

  /**
   * @description Send the PUT HTTP request
   * @param resource: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static put(resource: string, params: any): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.put(`${resource}`, params);
  }

  /**
   * @description Send the DELETE HTTP request
   * @param resource: string
   * @returns Promise<AxiosResponse>
   */
  public static delete(resource: string): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.delete(resource);
  }

    /**
   * @description Send a multipart POST HTTP request
   * @param resource: string
   * @param params: Object of parameters and files to be sent
   * @returns Promise<AxiosResponse>
   */
    public static multipartPost(resource: string, params: any): Promise<AxiosResponse> {
      // Creating FormData object
      const formData = new FormData();
  
      // Appending parameters to FormData
      Object.keys(params).forEach(key => {
        if (Array.isArray(params[key])) {
          params[key].forEach((value: any, index: number) => {
            formData.append(`${key}[${index}]`, value);
          });
        } else {
          formData.append(key, params[key]);
        }
      });
  
      // Setting the Content-Type to multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
  
      // Sending the POST request
      return ApiService.vueInstance.axios.post(`${resource}`, formData, config);
    }
}

export default ApiService;
