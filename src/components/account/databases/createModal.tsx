'use client'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InfoIcon } from 'lucide-react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { useRouter } from '@/i18n/routing'

export default function CreateDatabaseModal() {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [step, setStep] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [companyName, setCompanyName] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [postalCode, setPostalCode] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [country, setCountry] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [vat, setVAT] = useState<string>('')
  const [userPrefix, setUserPrefix] = useState<string>('')
  const { toast } = useToast()
  const router = useRouter()

  const createDatabase = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    /*
    await createCompanyData(
      companyName,
      city,
      postalCode,
      phone,
      email,
      vat,
      country,
      userPrefix
    )
      .catch((error) => {
        toast({
          title: 'An error occurred while creating the database.',
          variant: 'destructive',
        })
        Sentry.captureException(
          'An error occurred while creating the database. ' + error
        )
      })
      .then((response) => {
        if (response && response.status === 409) {
          toast({
            title: 'This user prefix is already in use.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Database created successfully.',
          })
          setModalOpen(false)
          router.refresh()
          reset()
        }
      })
     */
  }

  const handleNext = () => {
    if (
      step === 0 &&
      (!companyName || !address || !postalCode || !city || !country || !email)
    ) {
      toast({
        title: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    if (step === 1 && !userPrefix) {
      toast({
        title: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    if (step < 1) {
      setStep(step + 1)
      setProgress((step + 1) * 100)
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
      setProgress((step - 1) * 100)
    }
  }

  const reset = () => {
    setModalOpen(false)
    setStep(0)
    setProgress(0)
    setCompanyName('')
    setAddress('')
    setPostalCode('')
    setCity('')
    setCountry('')
    setEmail('')
    setPhone('')
    setVAT('')
    setUserPrefix('')
  }

  return (
    <AlertDialog onOpenChange={(value) => !value && reset()} open={modalOpen}>
      <AlertDialogTrigger asChild>
        <Button className="mt-4" onClick={() => setModalOpen(true)}>
          Create database
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="min-w-full min-h-full">
        <AlertDialogHeader>
          {step === 0 && (
            <AlertDialogTitle className={'text-center'}>
              Company data
            </AlertDialogTitle>
          )}
          {step === 1 && (
            <AlertDialogTitle className={'text-center'}>
              Database info
            </AlertDialogTitle>
          )}
          <AlertDialogDescription className={'text-center'}>
            Please fill in the info we need to create your database.
          </AlertDialogDescription>
          <Progress className={'mt-4 mx-auto w-[300px]'} value={progress} />
        </AlertDialogHeader>
        {step === 0 && (
          <div className="grid lg:grid-cols-2 gap-4 py-4 mx-auto">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyname" className="text-right">
                Company name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyname"
                className="col-span-3"
                required
                onChange={(e) => setCompanyName(e.target.value)}
                value={companyName}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address<span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                className="col-span-3"
                required
                onChange={(e) => setAddress(e.target.value)}
                value={address}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="postalcode" className="text-right">
                Postal Code<span className="text-red-500">*</span>
              </Label>
              <Input
                id="postalcode"
                className="col-span-3"
                required
                onChange={(e) => setPostalCode(e.target.value)}
                value={postalCode}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City<span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                className="col-span-3"
                required
                onChange={(e) => setCity(e.target.value)}
                value={city}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                Country<span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setCountry(value)}
                value={country}
                required
                autoComplete="country"
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue defaultValue={country} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="france">France</SelectItem>
                  <SelectItem value="germany">Germany</SelectItem>
                  <SelectItem value="netherlands">Netherlands</SelectItem>
                  <SelectItem value="unitedkingdom">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-Mail address<span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type={'email'}
                className="col-span-3"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone number
              </Label>
              <Input
                id="phone"
                className="col-span-3"
                required
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vat" className="text-right">
                VAT
              </Label>
              <Input
                id="vat"
                className="col-span-3"
                onChange={(e) => setVAT(e.target.value)}
                value={vat}
              />
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-4 py-4 mx-auto">
            <div className="flex items-center gap-4">
              <Label
                htmlFor="userprefix"
                className="text-right whitespace-nowrap"
              >
                User prefix<span className="text-red-500">*</span>
              </Label>
              <HoverCard>
                <HoverCardTrigger>
                  <InfoIcon className={'h-4'} />
                </HoverCardTrigger>
                <HoverCardContent>
                  A user prefix is a unique identifier for your database. It
                  will be used to generate the user&apos;s login. It should be
                  alphanumeric and between 3 and 10 characters long.
                  <hr className={'my-2'} />
                  For example if your user prefix is &quot;acme&quot;, your
                  users will have the following login: &quot;acme-johndoe&quot;.
                </HoverCardContent>
              </HoverCard>
              <Input
                id="userprefix"
                className="col-span-3"
                onChange={(e) => setUserPrefix(e.target.value)}
                value={userPrefix}
              />
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handlePrevious} disabled={step === 0}>
            Previous
          </Button>
          {step === 1 ? (
            <Button type={'submit'} onClick={createDatabase}>
              Create
            </Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
