import { JsonSchemaModel, JsonSchemaPropertyModel } from "../json-schema";
import { cloneDeep, isEmpty } from "lodash";
import { PropertyConfigModel } from "./PropertyConfigModel";
import { sortAlphabetically } from "../generators/util/sorting";

export interface EventConfigModel {
  description?: string;
  properties?: Record<string, PropertyConfigModel>;
  required?: string[];
}

export interface AnalyticsConfigModel {
  events?: {
    [eventName: string]: EventConfigModel;
  }
}

export class AnalyticsConfig {
  constructor(private model: AnalyticsConfigModel) {}

  hasEvents(): boolean {
    return Object.keys(this.model.events ?? {}).length > 0;
  }

  getEventNames(): string[] {
    return Object.keys(this.model.events ?? {});
  }

  getEventSchemas(): JsonSchemaPropertyModel[] {
    return this.getEventNames().map(name => ({
      type: 'object',
      title: name,
      additionalProperties: false,
      ...cloneDeep(this.model.events?.[name]),
    }));
  }

  setEvents(eventSchemas: JsonSchemaModel[]) {
    const events = {};

    eventSchemas
      .sort((a, b) => sortAlphabetically(a.title, b.title))
      .forEach(event => {
        const sanitizedEvent: any = {};
        // description
        if (!isEmpty(event.description)) {
          sanitizedEvent.description = event.description;
        }

        // properties
        const propertyNames = Object.keys(event.properties);
        if (propertyNames.length > 0) {
          let properties = {};
          propertyNames.forEach(propName => {
            const prop = event.properties[propName];
            const sanitizedProp = { ...prop };
            if (!prop.type) {
              delete sanitizedProp.type;
            }
            if (isEmpty(prop.description)) {
              delete sanitizedProp.description;
            }
            properties[propName] = sanitizedProp;
          })
          sanitizedEvent.properties = properties;
        }

        // required
        if (!isEmpty(event.required)) {
          sanitizedEvent.required = event.required;
        }

        events[event.title] = sanitizedEvent;
      });

    this.model.events = events;
  }

}
