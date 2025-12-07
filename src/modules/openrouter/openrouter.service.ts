import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import * as sysMsg from "../../constants/system.messages";
import { DocumentType } from "../documents/document.schema";
import { ExtractedMetadata } from "../../common/types";

/**
 * Interface for LLM analysis result
 */
export interface ILLMAnalysisResult {
  summary: string;
  documentType: DocumentType;
  extractedMetadata: ExtractedMetadata;
}

/**
 * Service for interacting with OpenRouter LLM API
 * Handles document analysis and metadata extraction
 */
@Injectable()
export class OpenrouterService {
  private readonly logger = new Logger(OpenrouterService.name);
  private axiosInstance: AxiosInstance;
  private model: string;
  private systemPrompt: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("OPENROUTER_API_KEY");
    if (!apiKey) {
      this.logger.error(sysMsg.OPENROUTER_API_KEY_MISSING);
      throw new InternalServerErrorException(sysMsg.OPENROUTER_API_KEY_MISSING);
    }

    this.axiosInstance = axios.create({
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/yourusername/ai-doc-summarizer",
        "X-Title": "AI Document Summarizer",
      },
      timeout: 60000, // 60 second timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Use a free/low-cost model
    this.model = "openai/gpt-4o-mini";

    // System prompt for structured JSON output
    this.systemPrompt = `You are an expert AI document analysis and summarization service. Your task is to process the provided document text and extract specific information.
      The output MUST be a single JSON object that conforms to the following schema:
      {
        "summary": "A concise, 3-5 sentence summary of the document.",
        "documentType": "One of: invoice, CV, report, letter, contract, article, other. Choose the most specific type.",
        "extractedMetadata": {
          "date": "The primary date mentioned in the document (YYYY-MM-DD or null)",
          "sender": "The name or organization that created or sent the document (or null)",
          "totalAmount": "The total monetary amount, if applicable, as a string with currency (e.g., '$1,234.50' or null)",
          "keywords": "A list of 5 key terms or concepts from the document (or [])"
        }
      }
      If a field is not applicable or not found, set its value to null. The summary is mandatory.
      Respond ONLY with the JSON object. Do not include introductory or concluding text.`;
  }

  /**
   * Analyzes a document's text using OpenRouter LLM
   */
  async analyzeDocument(extractedText: string): Promise<ILLMAnalysisResult> {
    const userPrompt = `Analyze the following document text and provide the output in the requested JSON format:\n\n---\n\n${extractedText}`;

    const payload = {
      model: this.model,
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    };

    try {
      const response = await this.axiosInstance.post(
        "/chat/completions",
        payload,
        {
          validateStatus: (status) => status < 500, // Don't throw on 4xx errors
        },
      );

      // Check for API errors with specific handling
      if (response.status === 401 || response.status === 403) {
        this.logger.error(
          `OpenRouter authentication failed: ${response.status}`,
        );
        throw new InternalServerErrorException(sysMsg.OPENROUTER_UNAUTHORIZED);
      }

      if (response.status === 429) {
        this.logger.error("OpenRouter rate limit exceeded");
        throw new InternalServerErrorException(sysMsg.OPENROUTER_RATE_LIMIT);
      }

      if (response.status === 402) {
        this.logger.error("OpenRouter insufficient credits");
        throw new InternalServerErrorException(
          sysMsg.OPENROUTER_INSUFFICIENT_CREDITS,
        );
      }

      if (response.status >= 400) {
        this.logger.error(
          `OpenRouter API error: ${response.status}`,
          response.data,
        );
        throw new InternalServerErrorException(
          `OpenRouter API error: ${response.data?.error?.message || "Unknown error"}`,
        );
      }

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new InternalServerErrorException(sysMsg.LLM_RESPONSE_INVALID);
      }

      const parsedContent = JSON.parse(content);

      // Validate required fields
      if (
        !parsedContent.summary ||
        !parsedContent.documentType ||
        !parsedContent.extractedMetadata
      ) {
        this.logger.error(
          "LLM response missing required fields",
          parsedContent,
        );
        throw new InternalServerErrorException(sysMsg.LLM_RESPONSE_INVALID);
      }

      this.logger.log(sysMsg.LLM_ANALYSIS_SUCCESS);
      return parsedContent as ILLMAnalysisResult;
    } catch (error) {
      const errorMsg =
        error.code === "ECONNRESET"
          ? "Connection to OpenRouter was reset. The document might be too large or the network is unstable."
          : error.response?.data?.error?.message || error.message;

      this.logger.error(`${sysMsg.LLM_ANALYSIS_FAILED}: ${errorMsg}`);
      throw new InternalServerErrorException(sysMsg.LLM_ANALYSIS_FAILED);
    }
  }
}
