import React, { PropTypes as type } from 'react'
import Slider from './Slider'
import AutoComplete from 'material-ui/AutoComplete'
import IconButton from 'material-ui/IconButton'
import GSForm from '../components/forms/GSForm'
import yup from 'yup'
import Form from 'react-formal'
import { MenuItem } from 'material-ui/Menu'
import OrganizationJoinLink from './OrganizationJoinLink'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
import CampaignFormSectionHeading from './CampaignFormSectionHeading'
import { StyleSheet, css } from 'aphrodite'
import theme from '../styles/theme'
import Toggle from 'material-ui/Toggle'
import DeleteIcon from 'material-ui/svg-icons/action/delete'

const styles = StyleSheet.create({
  sliderContainer: {
    border: `1px solid ${theme.colors.lightGray}`,
    padding: 10,
    borderRadius: 8
  },
  texterRow: {
    display: 'flex',
    flexDirection: 'row'
  },
  nameColumn: {
    width: 100,
    textOverflow: 'ellipsis',
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingRight: 10
  },
  splitToggle: {
    ...theme.text.body,
    flex: '1 1 50%'
  },
  slider: {
    flex: '1 1 35%',
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingRight: 10
  },
  leftSlider: {
    flex: '1 1 35%',
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingRight: 10
  },
  headerContainer: {
    display: 'flex',
    borderBottom: `1px solid ${theme.colors.lightGray}`,
    marginBottom: 20
  },
  assignedCount: {
    width: 40,
    fontSize: 16,
    paddingLeft: 5,
    paddingRight: 5,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: 10,
    display: 'inline-block',
    backgroundColor: theme.colors.lightGray
  },
  input: {
    width: 50,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 10,
    marginTop: 'auto',
    marginBottom: 'auto',
    display: 'inline-block'
  }
})

const inlineStyles = {
  autocomplete: {
    marginBottom: 24
  },
  radioButtonGroup: {
    marginBottom: 12
  },
  header: {
    ...theme.text.header
  }
}

export default class CampaignTextersForm extends React.Component {
  state = {
    autoSplit: true,
    focusedTexter: null
  }
  dataSourceItem(name, key) {
    return {
      text: name,
      value: (
        <MenuItem
          key={key}
          primaryText={name}
        />
      )
    }
  }

  showSearch() {
    const { orgTexters } = this.props
    const { texters } = this.formValues()

    const assignAll = texters.length === orgTexters.length
    const dataSource = orgTexters
      .filter((orgTexter) =>
        !texters.find((texter) => texter.id === orgTexter.id))
      .map((orgTexter) =>
          this.dataSourceItem(orgTexter.displayName,
          orgTexter.id
        )
    )

    const filter = (searchText, key) => ((key === 'allTexters') ? true : AutoComplete.caseInsensitiveFilter(searchText, key))
    const valueSelected = assignAll ? 'assignAll' : 'assignIndividual'

    const autocomplete = (
      <AutoComplete
        ref='autocomplete'
        style={inlineStyles.autocomplete}
        autoFocus
        searchText=''
        filter={filter}
        hintText='Search for texters to assign'
        dataSource={dataSource}
        onNewRequest={(value) => {
          // If you're searching but get no match, value is a string
          // representing your search term, but we only want to handle matches
          if (typeof value === 'object') {
            const texterId = value.value.key
            const newTexter = this.props.orgTexters.find((texter) => texter.id === texterId)
            this.onChange({
              texters: [
                ...this.formValues().texters,
                {
                  id: texterId,
                  firstName: newTexter.firstName,
                  assignment: {
                    contactsCount: 0,
                    needsMessageCount: 0
                  }
                }
              ]
            })
          }
        }}
      />
    )

    return orgTexters.length === 0 ? '' : (
      <div>
        <RadioButtonGroup
          style={inlineStyles.radioButtonGroup}
          name='assignment'
          valueSelected={valueSelected}
          onChange={(event, value) => {
            let newTexters = []
            if (value === 'assignAll') {
              const unassignedTexters = this.props.orgTexters.filter((texter) =>
                typeof this.formValues().texters.find((ele) => texter.id === ele.id) === 'undefined'
              )
              newTexters = this.formValues()
                .texters
                .concat(unassignedTexters
                  .map((orgTexter) => ({
                    id: orgTexter.id,
                    firstName: orgTexter.firstName,
                    assignment: {
                      contactsCount: 0,
                      needsMessageCount: 0
                    }
                  }))
                )
            } else {
              newTexters = this.formValues().texters.filter((texter) =>
                texter.assignment.contactsCount !== texter.assignment.needsMessageCount
              )
            }
            this.onChange({ texters: newTexters })
          }}
        >
          <RadioButton
            value='assignAll'
            label='Everyone available'
          />
          <RadioButton
            value='assignIndividual'
            label='Choose individual people to assign'
          />
        </RadioButtonGroup>
        {!assignAll ? autocomplete : ''}
      </div>
    )
  }

  showTexters() {
    return this.formValues().texters.map((texter, index) => {
      const messagedCount = texter.assignment.contactsCount - texter.assignment.needsMessageCount

      return (
        <div className={css(styles.texterRow)}>
          <div className={css(styles.leftSlider)}>
            <Slider
              maxValue={this.formValues().contactsCount}
              value={messagedCount}
              color={theme.colors.darkGray}
              direction={1}
            />
          </div>
          <div className={css(styles.assignedCount)}>
            {messagedCount}
          </div>
          <div className={css(styles.nameColumn)}>
            {`${texter.firstName}`}
          </div>
          <div className={css(styles.input)}>
            <Form.Field
              name={`texters[${index}].assignment.needsMessageCount`}
              hintText='Contacts'
              fullWidth
              onFocus={() => this.setState({ focusedTexter: texter.id })}
              onBlur={() => this.setState({
                focusedTexter: null
              })}
            />
          </div>
          <div className={css(styles.slider)}>
            <Slider
              maxValue={this.formValues().contactsCount}
              value={texter.assignment.needsMessageCount}
              color={theme.colors.green}
              direction={0}
            />
          </div>
          <IconButton
            onTouchTap={async () => {
              const currentFormValues = this.formValues()
              const newFormValues = {
                ...currentFormValues
              }
              newFormValues.texters = newFormValues.texters.slice()
              if (messagedCount === 0) {
                newFormValues.texters.splice(index, 1)
              } else {
                await this.setState({ focusedTexter: texter.id })
                newFormValues.texters[index] = {
                  ...texter,
                  assignment: {
                    needsMessageCount: 0
                  }
                }
              }
              this.onChange(newFormValues)
            }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      )
    })
  }

  formSchema = yup.object({
    texters: yup.array().of(yup.object({
      id: yup.string(),
      assignment: yup.object({
        needsMessageCount: yup.string()
      })
    }))
  })

  onChange = (formValues) => {
    const existingFormValues = this.formValues()
    const changedTexter = this.state.focusedTexter
    const newFormValues = {
      ...formValues
    }
    let totalNeedsMessage = 0
    let totalMessaged = 0
    const texterCountChanged = newFormValues.texters.length !== existingFormValues.texters.length
    newFormValues.texters = newFormValues.texters.map((newTexter) => {
      const existingTexter = existingFormValues.texters.filter((texter) => (texter.id === newTexter.id ? texter : null))[0]
      let messagedCount = 0
      if (existingTexter) {
        messagedCount = existingTexter.assignment.contactsCount - existingTexter.assignment.needsMessageCount
        totalMessaged += messagedCount
      }

      let convertedNeedsMessageCount = parseInt(newTexter.assignment.needsMessageCount, 10)
      if (isNaN(convertedNeedsMessageCount)) {
        convertedNeedsMessageCount = 0
      }
      if (convertedNeedsMessageCount + messagedCount > this.formValues().contactsCount) {
        convertedNeedsMessageCount = this.formValues().contactsCount - messagedCount
      }

      if (convertedNeedsMessageCount < 0) {
        convertedNeedsMessageCount = 0
      }

      if (texterCountChanged && this.state.autoSplit) {
        convertedNeedsMessageCount = 0
      }

      totalNeedsMessage = totalNeedsMessage + convertedNeedsMessageCount

      return {
        ...newTexter,
        assignment: {
          ...newTexter.assignment,
          contactsCount: convertedNeedsMessageCount + messagedCount,
          needsMessageCount: convertedNeedsMessageCount
        }
      }
    })

    let extra = totalNeedsMessage + totalMessaged - this.formValues().contactsCount
    if (extra > 0) {
      let theTexter = newFormValues.texters[0]
      if (changedTexter) {
        theTexter = newFormValues.texters.find((ele) => ele.id === changedTexter)
      }

      newFormValues.texters.forEach((texter) => {
        const messagedCount = texter.assignment.contactsCount - texter.assignment.needsMessageCount
        if (texter.id === theTexter.id) {
          texter.assignment.needsMessageCount = this.formValues().contactsCount - totalMessaged
        } else {
          texter.assignment.needsMessageCount = 0
        }
        texter.assignment.contactsCount = texter.assignment.needsMessageCount + messagedCount
      })
    } else {
      const factor = 1
      let index = 0
      if (newFormValues.texters.length === 1 && this.state.autoSplit) {
        const messagedCount = newFormValues.texters[0].assignment.contactsCount - newFormValues.texters[0].assignment.needsMessageCount
        newFormValues.texters[0].assignment.contactsCount = this.formValues().contactsCount
        newFormValues.texters[0].assignment.needsMessageCount = this.formValues().contactsCount - messagedCount
      } else if (newFormValues.texters.length > 1 && (extra > 0 || (extra < 0 && this.state.autoSplit))) {
        while (extra !== 0) {
          const texter = newFormValues.texters[index]
          if (!changedTexter || texter.id !== changedTexter) {
            if (texter.assignment.needsMessageCount + factor >= 0) {
              texter.assignment.needsMessageCount = texter.assignment.needsMessageCount + factor
              texter.assignment.contactsCount = texter.assignment.contactsCount + factor
              extra = extra + factor
            }
          }
          index = index + 1
          if (index >= newFormValues.texters.length) {
            index = 0
          }
        }
      }
    }

    this.props.onChange(newFormValues)
  }

  formValues() {
    return {
      ...this.props.formValues,
      texters: this.props.formValues.texters.sort((texter1, texter2) => {
        if (texter1.firstName < texter2.firstName) {
          return -1
        } else if (texter1.firstName > texter2.firstName) {
          return 1
        }
        return 0
      })
    }
  }

  render() {
    const { organizationId } = this.props
    let subtitle = ''
    subtitle = (
      <div>
        <OrganizationJoinLink organizationId={organizationId} />
      </div>
    )

    const assignedContacts = this.formValues()
      .texters
      .reduce(((prev, texter) => prev + texter.assignment.contactsCount), 0)

    const headerColor = assignedContacts === this.formValues().contactsCount ? theme.colors.green : theme.colors.orange
    return (
      <div>
        <CampaignFormSectionHeading
          title='Who should send the texts?'
          subtitle={subtitle}
        />
        <GSForm
          schema={this.formSchema}
          value={this.formValues()}
          onChange={this.onChange}
          onSubmit={this.props.onSubmit}
        >
          {this.showSearch()}
          <div className={css(styles.sliderContainer)}>
            <div className={css(styles.headerContainer)}>
              <div
                style={{
                  ...inlineStyles.header,
                  color: headerColor,
                  flex: '1 1 50%'
                }}
              >
                {`Assigned contacts: ${assignedContacts}/${this.formValues().contactsCount}`}
              </div>
              <div
                className={css(styles.splitToggle)}
              >
                <Toggle
                  label='Auto-split assignments'
                  style={{
                    width: 'auto',
                    marginLeft: 'auto'
                  }}
                  toggled={this.state.autoSplit}
                  onToggle={() => {
                    this.setState({ autoSplit: !this.state.autoSplit }, () => {
                      if (this.state.autoSplit) {
                        const contactsCount = Math.floor(this.formValues().contactsCount / this.formValues().texters.length)
                        const newTexters = this.formValues().texters.map((texter) => {
                          return {
                            ...texter,
                            assignment: {
                              ...texter.assignment,
                              contactsCount
                            }
                          }
                        })
                        this.onChange({ ...this.formValues(), texters: newTexters })
                      }
                    })
                  }}
                />
              </div>
            </div>
            {this.showTexters()}
          </div>
          <Form.Button
            type='submit'
            label={this.props.saveLabel}
            disabled={this.props.saveDisabled}
          />
        </GSForm>
      </div>
    )
  }
}

CampaignTextersForm.propTypes = {
  onChange: type.func,
  orgTexters: type.array,
  ensureComplete: type.bool,
  organizationId: type.string,
  formValues: type.object,
  contactsCount: type.number,
  onSubmit: type.func,
  saveLabel: type.string,
  saveDisabled: type.bool
}

