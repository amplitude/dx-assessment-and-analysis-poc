import axios from 'axios';
import SchemaGen from "./schemagen";
import { sortAlphabetically } from "../../generators/util/sorting";

// https://data-api.amplitude.com/graphql?q=VersionTemplates
// const DATA_API_BASE_URL = 'https://data-api.amplitude.com/graphql';
const DATA_API_BASE_URL = 'https://data-api.staging.amplitude.com/graphql';

export class DataEventSource {
  id: string;
  name: string;
}

enum DataEventPropertyType {
  String = "0",
  Number = "1",
  Boolean = "2",
  Array = "3",
  Any = "4",
  Enum = "5",
  Const = "6",
  Null = "7",
  Object = "8",
}

export class DataEventProperty {
  id: string;
  name: string;
  description: string;
  required: boolean;
  type: string; // "number" e.g. "1"
  schema: any;
}

export class DataEvent {
  id: string;
  name: string;
  description: string;
  isDeleted: string;
  properties: DataEventProperty[];
  sources: DataEventSource[];
}

export function convertToEventSchema(workspaceId: string, event: DataEvent) {
  return SchemaGen.generateEventSchema(
    workspaceId,
    event.name,
    "",
    event.description,
    event.properties as any[]
  );
}

export class DataApiService {
  private readonly headers: Record<string, string>;

  constructor(private token: string) {
    this.headers = {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    };
  }

  /**
   * Get a list of Experiments (aka Flags)
   *
   * https://www.docs.developers.amplitude.com/experiment/apis/management-api/#list-experiments
   *
   * @param deployment
   * @param limit
   */
  async getEvents(orgId: string, workspaceId: string, branchId: string, versionId:string, sourceId:string): Promise<DataEvent[]> {
    try {
      const response = await axios.post(`${DATA_API_BASE_URL}?q=VersionEvents`, {
          query: `
query versions($orgId: ID!, $workspaceId: ID!, $branchId: ID!, $versionId: ID!) {
  orgs(id: $orgId) {
    workspaces(id: $workspaceId) {
      branches(id: $branchId) {
        name
        versions(id: $versionId) {
          id
          majorVersion
          minorVersion
          patchVersion
          events {
            id
            name
            description
            isDeleted
            properties {
              id
              name
              description
              required
              type
              schema
            }
            sources {
              id
              name
            }
          }
        }
      }
    }
  }
}`,
        variables: {
          orgId, workspaceId, branchId, versionId, sourceId
        }
      }, {
        headers: this.headers
      });

      const events:DataEvent[] = response.data.data.orgs[0].workspaces[0].branches[0].versions[0].events;

      return events.sort((a, b) => sortAlphabetically(a.name, b.name))
    }
    catch (e) {
      console.error(`Error loading Events from Data server.`, e)
      return [];
    }
  }
}
