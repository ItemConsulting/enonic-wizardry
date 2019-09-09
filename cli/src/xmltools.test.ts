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
</content-type>\n`
};

describe("parseXML", () => {
  test("sets the name field", () => {
    const tsInterface = xmltools.parseXML("Employee", xml.simple);
    expect(tsInterface.name).toBe("Employee");
  });

  test("parses all inputs", () => {
    const tsInterface = xmltools.parseXML("Employee", xml.simple);
    expect(tsInterface.fields.length).toBe(2);
  });

  test("parses field names", () => {
    const tsInterface = xmltools.parseXML("Employee", xml.simple);
    expect(tsInterface.fields[0].name).toBe("firstName");
    expect(tsInterface.fields[1].name).toBe("lastName");
  });

  test("parses optional inputs", () => {
    const tsInterface = xmltools.parseXML("Employee", xml.simple);
    expect(tsInterface.fields[0].optional).toBe(false);
    expect(tsInterface.fields[1].optional).toBe(true);
  });

  test("parses inputs with missing name", () => {
    const tsInterface = xmltools.parseXML("Employee", xml.simpleMissingName);
    expect(tsInterface.fields[0].name).toBe("invalidName");
  });

  test("parses inputs with missing comment", () => {
    const tsInterface = xmltools.parseXML("Employee", xml.simpleMissingComment);
    expect(tsInterface.fields[0].comment).toBe("");
  });

  test("parses optional inputs with missing occurrences", () => {
    // Occurences defaults to minimum=0, maximum=1
    // See: https://developer.enonic.com/docs/xp/stable/cms/schemas#input_types
    const tsInterface = xmltools.parseXML("Employee", xml.simpleMissingOccurrences);
    expect(tsInterface.fields[0].optional).toBe(true);
    expect(tsInterface.fields[1].optional).toBe(true);
  });

  test("parses FieldSets as a flat structure", () => {
    const tsInterface = xmltools.parseXML("Employee", xml.fieldSet);
    expect(tsInterface.fields.length).toBe(2);
  });

  test("parses ItemSets as a nested structure", () => {
    const tsInterface = xmltools.parseXML("Employee", xml.itemSet);
    console.log(JSON.stringify(tsInterface));
    expect(tsInterface.fields.length).toBe(1);
    expect(tsInterface.fields[0].subfields.length).toBe(3);
    expect(tsInterface.fields[0].subfields[2].subfields.length).toBe(1);
  });
});
