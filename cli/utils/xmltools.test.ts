import * as xmltools from "./xmltools";

const xml = {
  employee: `<content-type>
  <display-name>Employee</display-name>
  <super-type>base:structured</super-type>
  <form>
    <input type="TextLine" name="firstName">
      <label>First name</label>
      <occurrences minimum="1" maximum="1"/>
    </input>
    <input type="TextLine" name="lastName">
      <label>Last name</label>
      <occurrences minimum="0" maximum="1"/>
    </input>
    <item-set name="contactInfo">
      <label>Contact Info</label>
      <occurrences minimum="0" maximum="0"/>
      <items>
        <input name="label" type="TextLine">
          <label>Label</label>
          <occurrences minimum="0" maximum="1"/>
        </input>
        <input name="phoneNumber" type="TextLine">
          <label>Phone Number</label>
          <occurrences minimum="0" maximum="1"/>
        </input>
      </items>
    </item-set>
  </form>
  </content-type>
  `,

  simple: `<content-type>
  <display-name>Employee</display-name>
  <super-type>base:structured</super-type>
  <form>
    <input type="TextLine" name="firstName">
      <label>First name</label>
      <occurrences minimum="1" maximum="1"/>
    </input>
    <input type="TextLine" name="lastName">
      <label>Last name</label>
      <occurrences minimum="0" maximum="1"/>
    </input>
  </form>
  </content-type>\n`,

  simpleMissingName: `<content-type>
  <display-name>Employee</display-name>
  <super-type>base:structured</super-type>
  <form>
    <input type="TextLine">
      <label>First name</label>
      <occurrences minimum="1" maximum="1"/>
    </input>
  </form>
  </content-type>\n`,

  simpleMissingComment: `<content-type>
  <display-name>Employee</display-name>
  <super-type>base:structured</super-type>
  <form>
    <input type="TextLine" name="firstName">
      <occurrences minimum="1" maximum="1"/>
    </input>
  </form>
  </content-type>\n`,

  simpleMissingOccurrences: `<content-type>
  <display-name>Employee</display-name>
  <super-type>base:structured</super-type>
  <form>
    <input type="TextLine" name="firstName">
    </input>
    <input type="TextLine" name="lastName">
      <occurrences maximum="1"/>
    </input>
  </form>
  </form>
  </content-type>\n`,

  itemSet: `<content-type>
<display-name>Employee</display-name>
<super-type>base:structured</super-type>
<form>
  <item-set name="contactInfo">
    <label>Contact Info</label>
    <occurrences minimum="0" maximum="0"/>
    <items>
      <input name="label" type="TextLine">
        <label>Label</label>
        <occurrences minimum="0" maximum="1"/>
      </input>
      <input name="phoneNumber" type="TextLine">
        <label>Phone Number</label>
        <occurrences minimum="0" maximum="1"/>
      </input>
      <item-set name="contactInfo">
        <label>Contact Info</label>
        <occurrences minimum="0" maximum="0"/>
        <items>
          <input name="phoneNumber" type="TextLine">
            <label>Phone Number</label>
            <occurrences minimum="0" maximum="1"/>
          </input>
        </items>
      </item-set>
    </items>
  </item-set>
</form>
</content-type>\n`,

  fieldSet: `<content-type>
<display-name>Employee</display-name>
<super-type>base:structured</super-type>
<form>
  <field-set name="Juryvotes">
    <label>Juryavgjørelser</label>
    <items>
        <input type="TextArea" name="juryvote1">
            <label>Runde 1</label>
            <occurrences minimum="0" maximum="1"/>
        </input>
        <input type="TextArea" name="juryvote2">
            <label>Runde 2</label>
            <occurrences minimum="0" maximum="1"/>
        </input>
    </items>
  </field-set>
</form>
</content-type>\n`,

  minimalSite: `<site>
  <form/>
</site>`,

  simpleSite: `<site>
  <processors> 
    <response-processor name="tracker" order="10"/>  
  </processors>
  <mappings> 
     <mapping controller="/site/foobar/api.js" order="10">
       <pattern>/api/v\d+/.*</pattern>
     </mapping>
     <mapping controller="/site/pages/default/default.js">
       <match>type:'portal:fragment'</match>
     </mapping>
   </mappings>
   <form> 
    <input type="TextLine" name="company">
      <label>Company</label>
      <occurrences minimum="1" maximum="1"/>
    </input>
  </form>
  <x-data name="seo-settings"/> 
</site>`,

  simplePage: `<page>
  <display-name i18n="component.page.name">My first page</display-name>
  <description>Front page of our site</description>
  <form>
    <input type="TextLine" name="pageName">
      <label>Page Name</label>
      <occurrences minimum="1" maximum="1"/>
    </input>
  </form>
  <regions>
    <region name="main"/>
  </regions>
</page>`,

  simplePart: `<part>
  <display-name i18n="employeeForm.displayName">Employee Form</display-name>
  <description i18n="employeeForm.description">Edit the information of an employee</description>
  <form>
    <input type="TextLine" name="partPart">
      <label>Part of a part</label>
      <occurrences minimum="0" maximum="10"/>
    </input>
  </form>
</part>`,

  missingForm: `<part>
  <display-name i18n="groupForm.displayName">Group form</display-name>
  <description i18n="groupForm.description">Edit description about tahe group</description>
</part>`,

  mixinUser: `<content-type>
  <display-name>Using mixins</display-name>
  <form>
    <input type="TextLine" name="firstName">
      <label>First Name</label>
      <occurrences minimum="1" maximum="1"/>
    </input>
    <input type="TextLine" name="lastName">
      <label>Last Name</label>
      <occurrences minimum="1" maximum="1"/>
    </input>
    <mixin name="address"/>
  </form>
</content-type>`,

  mixin: `<mixin>
  <display-name>Full address</display-name>
  <form>
    <input type="TextLine" name="addressLine">
      <label>Street address</label>
      <occurrences minimum="0" maximum="2"/>
    </input>
    <input type="TextLine" name="city">
      <label>City</label>
      <occurrences minimum="1" maximum="1"/>
    </input>
    <input type="TextLine" name="zipCode">
      <label>Zip code</label>
      <occurrences minimum="1" maximum="1"/>
    </input>
    <input type="TextLine" name="country">
      <label>Country</label>
      <occurrences minimum="1" maximum="1"/>
    </input>
  </form>
</mixin>`
};

describe("parseXML", () => {
  test("sets the name field", () => {
    const tsInterface = xmltools.parseXml("Employee", xml.simple);
    expect(tsInterface.name).toBe("Employee");
  });

  test("parses all inputs", () => {
    const tsInterface = xmltools.parseXml("Employee", xml.simple);
    expect(tsInterface.fields.length).toBe(2);
  });

  test("parses field names", () => {
    const tsInterface = xmltools.parseXml("Employee", xml.simple);
    expect(tsInterface.fields[0].name).toBe("firstName");
    expect(tsInterface.fields[1].name).toBe("lastName");
  });

  test("parses no form as 0 fields", () => {
    const tsInterface = xmltools.parseXml("Employee", xml.missingForm);
    expect(tsInterface.fields).toHaveLength(0);
  });

  test("parses optional inputs", () => {
    const tsInterface = xmltools.parseXml("Employee", xml.simple);
    expect(tsInterface.fields[0].optional).toBe(false);
    expect(tsInterface.fields[1].optional).toBe(true);
  });

  test("parses inputs with missing name", () => {
    expect(() => {
      xmltools.parseXml("Employee", xml.simpleMissingName);
    }).toThrow();
  });

  test("parses inputs with missing comment", () => {
    const tsInterface = xmltools.parseXml("Employee", xml.simpleMissingComment);
    expect(tsInterface.fields[0].comment).toBe("");
  });

  test("parses optional inputs with missing occurrences", () => {
    // Occurences defaults to minimum=0, maximum=1
    // See: https://developer.enonic.com/docs/xp/stable/cms/schemas#input_types
    const tsInterface = xmltools.parseXml(
      "Employee",
      xml.simpleMissingOccurrences
    );
    expect(tsInterface.fields[0].optional).toBe(true);
    expect(tsInterface.fields[1].optional).toBe(true);
  });

  test("parses FieldSets as a flat structure", () => {
    const tsInterface = xmltools.parseXml("Employee", xml.fieldSet);
    expect(tsInterface.fields.length).toBe(2);
  });

  test("parses ItemSets as a nested structure", () => {
    const tsInterface = xmltools.parseXml("Employee", xml.itemSet);
    expect(tsInterface.fields.length).toBe(1);
    expect(tsInterface.fields[0].subfields.length).toBe(3);
    expect(tsInterface.fields[0].subfields[2].subfields.length).toBe(1);
  });

  test("parses the minimal site", () => {
    const tsInterface = xmltools.parseXml("MySite", xml.minimalSite);
    expect(tsInterface.name).toBe("MySite");
    expect(tsInterface.fields).toHaveLength(0);
  });

  test("parses a simple site", () => {
    const tsInterface = xmltools.parseXml("MySite", xml.simpleSite);
    expect(tsInterface.name).toBe("MySite");
    expect(tsInterface.fields).toHaveLength(1);

    const field = tsInterface.fields[0];
    expect(field.name).toBe("company");
    expect(field.comment).toBe("Company");
    expect(field.optional).toBe(false);
  });

  test("parses a simple page", () => {
    const tsInterface = xmltools.parseXml("MyPage", xml.simplePage);
    expect(tsInterface.name).toBe("MyPage");
    expect(tsInterface.fields).toHaveLength(1);

    const field = tsInterface.fields[0];
    expect(field.name).toBe("pageName");
    expect(field.optional).toBe(false);
    expect(field.comment).toBe("Page Name");
  });

  test("parses a simple part", () => {
    const tsInterface = xmltools.parseXml(
      "SevenElevenWasAPartTimeJob",
      xml.simplePart
    );
    expect(tsInterface.name).toBe("SevenElevenWasAPartTimeJob");
    expect(tsInterface.fields).toHaveLength(1);

    const field = tsInterface.fields[0];
    expect(field.name).toBe("partPart");
    expect(field.optional).toBe(true);
    expect(field.comment).toBe("Part of a part");
  });

  test("parses mixins", () => {
    const tsInterface = xmltools.parseXml("MixinExample", xml.mixinUser);
    const mixins = tsInterface.fields.filter(field => field.type === "mixin");
    expect(mixins).toHaveLength(1);
    expect(mixins[0].name).toBe("address");
    expect(mixins[0].type).toBe("mixin");
  });
});

describe("InterfaceGenerator", () => {
  test("NewInterfaceGenerator creates a new InterfaceGenerator", () => {
    const generator = xmltools.NewInterfaceGenerator();
    expect(generator).toBeDefined();
    expect(generator).not.toBeNull();
  });

  test("throws when no mixin exists", () => {
    const generator = xmltools.NewInterfaceGenerator();
    expect(() => {
      generator.createInterface("MixedIn", xml.mixinUser);
    }).toThrow();
  });

  test("generates the correct input code", () => {
    const generator = xmltools.NewInterfaceGenerator();
    const tsInterface = generator.createInterface("Simple", xml.simple);
    expect(tsInterface).toMatchSnapshot();
  });

  test("generates the correct FieldSet code", () => {
    const generator = xmltools.NewInterfaceGenerator();
    const tsInterface = generator.createInterface("FieldSetUser", xml.fieldSet);
    expect(tsInterface).toMatchSnapshot();
  });

  test("generates the correct ItemSet code", () => {
    const generator = xmltools.NewInterfaceGenerator();
    const tsInterface = generator.createInterface("ItemSetUser", xml.itemSet);
    expect(tsInterface).toMatchSnapshot();
  });

  test("generates the correct mixin code", () => {
    const generator = xmltools.NewInterfaceGenerator();
    generator.addMixin("address", xml.mixin);
    const tsInterface = generator.createInterface("MixedIn", xml.mixinUser);
    expect(tsInterface).toMatchSnapshot();
  });
});

describe("generateInterfaceName", () => {
  test("sets the interface name in PascalCase", () => {
    const filenames = [
      "my_little_interface",
      "myLittleInterface",
      "my-little-interface"
    ];
    for (var filename of filenames) {
      const iname = xmltools.generateInterfaceName(filename);
      expect(iname).toBe("MyLittleInterface");
    }
  });

  test("drops the file extension", () => {
    const filename = "my-little-interface.xml";
    const iname = xmltools.generateInterfaceName(filename);
    expect(iname).toBe("MyLittleInterface");
  });

  test("drops the file path", () => {
    const filename = "/path/to/my-little-interface.xml";
    const iname = xmltools.generateInterfaceName(filename);
    expect(iname).toBe("MyLittleInterface");
  });
});